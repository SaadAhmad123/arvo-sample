import Anthropic from '@anthropic-ai/sdk';
import { anthropicCompletions as anthropicCompletionsContract } from '@repo/contracts/services';
import { llmCompletionStream } from '@repo/contracts/streams';
import { parseJSON } from '@repo/utilities';
import { llmJsonIntent } from '@repo/utilities/prompts';
import { type VersionedArvoContract, createArvoEventFactory, exceptionToSpan } from 'arvo-core';
import { type EventHandlerFactory, createArvoEventHandler } from 'arvo-event-handler';
import { anthropicRates } from './ratecards/anthropic.js';
import { serviceRate } from './ratecards/service.js';
import type { EventHandlerFactoryParams } from './types.js';

export const anthropicCompletions: EventHandlerFactory<
  EventHandlerFactoryParams<'ANTHROPIC_API_KEY', VersionedArvoContract<typeof llmCompletionStream, '1.0.0'>>
> = (param) =>
  createArvoEventHandler({
    contract: anthropicCompletionsContract,
    executionunits: serviceRate(),
    handler: {
      '1.0.0': async ({ event }) => {
        const settings = await param.settings();
        const anthropic = new Anthropic({
          apiKey: settings.ANTHROPIC_API_KEY,
        });
        const jsonUsageIntent = event.data.json_response ? llmJsonIntent.build({}) : '';

        // Create a stream for chat completions
        const stream = await anthropic.messages.create({
          max_tokens: event.data.max_tokens,
          stream: true,
          model: event.data.model,
          temperature: event.data.temperature,
          system: `${event.data.system_command}\n\n${jsonUsageIntent}`,
          messages: event.data.messages,
        });

        let response = '';
        let inputTokens = 0;
        let outputTokens = 0;
        let finishReason: 'stop' | 'length' | 'content_filter' = 'stop';

        let timeToFirstToken = 0;
        let firstTokenReceived = false;
        const startTime = performance.now();

        // Iterate over the stream and log each part
        for await (const part of stream) {
          let textDelta: string | null = null;

          if (!firstTokenReceived) {
            timeToFirstToken = performance.now() - startTime;
            firstTokenReceived = true;
          }
          if (part.type === 'message_start') {
            inputTokens = part.message.usage.input_tokens;
          }
          if (part.type === 'message_delta') {
            outputTokens = part.usage.output_tokens;
            if (part.delta.stop_reason) {
              const stopReasonMap = {
                end_turn: 'stop',
                max_tokens: 'length',
                stop_sequence: 'stop',
                tool_use: 'stop',
              };
              finishReason = stopReasonMap[part.delta.stop_reason] as typeof finishReason;
            }
          }
          if (part.type === 'content_block_start' && part.content_block.type === 'text') {
            textDelta = part.content_block.text;
          }
          if (part.type === 'content_block_delta' && part.delta.type === 'text_delta') {
            textDelta = part.delta.text;
          }

          response += textDelta ?? '';

          await param
            .streamer?.(
              createArvoEventFactory(llmCompletionStream.version('1.0.0')).accepts({
                subject: event.subject,
                source: event.type,
                data: {
                  delta: textDelta ?? '',
                  text: response,
                },
              }),
              event,
            )
            .catch((e) => exceptionToSpan(e));
        }
        const totalTime = performance.now() - startTime;
        const averageTokenTime = (totalTime - timeToFirstToken) / (outputTokens - 1);
        const totalLlmCost = anthropicRates[event.data.model]?.(inputTokens, outputTokens) ?? 0;

        return {
          type: 'evt.anthropic.completions.success',
          executionunits: serviceRate() + totalLlmCost,
          data: {
            json_valid: event.data.json_response ? Boolean(parseJSON(response)) : null,
            message: {
              role: 'assistant' as const,
              content: response,
            },
            usage: {
              tokens: {
                prompt: inputTokens,
                completion: outputTokens,
                total: inputTokens + outputTokens,
              },
              time_ms: {
                average_token: averageTokenTime,
                to_first_token: timeToFirstToken,
                total: totalTime,
              },
            },
            stop_reason: finishReason,
          },
        };
      },
    },
  });
