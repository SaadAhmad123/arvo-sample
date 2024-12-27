import * as contracts from '@repo/contracts';
import { parseJSON } from '@repo/utilities';
import { llmJsonIntent } from '@repo/utilities/prompts';
import { exceptionToSpan, logToSpan } from 'arvo-core';
import { type EventHandlerFactory, createArvoEventHandler } from 'arvo-event-handler';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { openaiRates } from './commons/ratecards/openai.js';
import { serviceRate } from './commons/ratecards/service.js';
import type { EventHandlerFactoryParams } from './types.js';

export const openaiCompletions: EventHandlerFactory<EventHandlerFactoryParams> = (param) =>
  createArvoEventHandler({
    contract: contracts.openaiCompletions,
    executionunits: 0.1,
    handler: {
      '1.0.0': async ({ event }) => {
        // Initialize the OpenAI client with provided parameters
        const openai = new OpenAI({
          apiKey: param.settings.OPENAI_API_KEY,
          organization: param.settings.OPENAI_ORG_ID,
          project: param.settings.OPENAI_PROJECT_ID,
        });
        const jsonUsageIntent = event.data.json_response ? llmJsonIntent.build({}) : '';

        // Create a stream for chat completions
        const stream = await openai.chat.completions.create({
          max_completion_tokens: event.data.max_tokens,
          temperature: event.data.temperature,
          stream: true,
          stream_options: {
            include_usage: true,
          },
          response_format: {
            type: event.data.json_response ? 'json_object' : 'text',
          },
          model: event.data.model,
          messages: [
            {
              role: 'system',
              content: `${event.data.system_command}\n\n${jsonUsageIntent}`,
            },
            ...event.data.messages.map(
              (item) =>
                ({
                  role: item.role,
                  content: item.content,
                }) as ChatCompletionMessageParam,
            ),
          ],
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
          textDelta = part?.choices?.[0]?.delta?.content ?? '';
          response += textDelta;
          inputTokens = part?.usage?.prompt_tokens ?? inputTokens;
          outputTokens = part?.usage?.completion_tokens ?? outputTokens;
          const finishReasonFromPart = part?.choices?.[0]?.finish_reason;
          if (
            finishReasonFromPart === 'stop' ||
            finishReasonFromPart === 'length' ||
            finishReasonFromPart === 'content_filter'
          ) {
            // @ts-ignore
            finishReason = finishReasonFromPart;
          } else if (finishReasonFromPart) {
            // Handle unexpected finish reasons
            logToSpan({
              level: 'WARNING',
              message: `Unexpected finish reason: ${finishReasonFromPart}. Defaulting to '${finishReason}'`,
            });
          }

          await param
            .streamer?.(
              {
                type: 'stream.openai.completion',
                data: {
                  delta: textDelta ?? '',
                  text: response,
                },
              },
              event,
            )
            .catch((e) => exceptionToSpan(e));
        }

        const totalTime = performance.now() - startTime;
        const averageTokenTime = (totalTime - timeToFirstToken) / (outputTokens - 1);
        const totalLlmCost = openaiRates[event.data.model]?.(inputTokens, outputTokens) ?? 0;

        return {
          type: 'evt.openai.completions.success',
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