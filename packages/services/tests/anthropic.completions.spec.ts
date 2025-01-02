import * as ServiceContracts from '@repo/contracts/services';
import { type InferVersionedArvoContract, type VersionedArvoContract, createArvoEventFactory } from 'arvo-core';
import { anthropicRates } from '../src/ratecards/anthropic.js';
import { serviceRate } from '../src/ratecards/service.js';
import * as ServiceFactories from '../src/index.js';
import { getMockSettingsFactory } from './utils/mock.settings.js';
import { telemetrySdkStart, telemetrySdkStop } from './utils/otel.js';

describe('anthropic.completions', () => {
  beforeAll(async () => {
    await telemetrySdkStart();
  });

  afterAll(async () => {
    await telemetrySdkStop();
  });

  const handler = ServiceFactories.anthropicCompletions({
    settings: getMockSettingsFactory(),
  });
  const invalidHandler = ServiceFactories.anthropicCompletions({
    settings: getMockSettingsFactory(true),
  });

  const contract = ServiceContracts.anthropicCompletions;
  const models: InferVersionedArvoContract<
    VersionedArvoContract<typeof contract, '1.0.0'>
  >['accepts']['data']['model'][] = [
    'claude-3-haiku-20240307',
    'claude-3-sonnet-20240229',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
  ];

  for (const model of [models[0]]) {
    it(`should work with model ${model}`, async () => {
      const event = createArvoEventFactory(contract.version('1.0.0')).accepts({
        subject: 'test',
        source: 'test',
        data: {
          model,
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
        },
      });

      const responses = await handler.execute(event, { inheritFrom: 'EVENT' });

      expect(responses.length).toBe(1);
      expect(responses[0]?.type).toBe('evt.anthropic.completions.success');
      expect(responses[0]?.subject).toBe('test');
      expect(responses[0]?.source).toBe('com.anthropic.completions');
      expect(responses[0]?.to).toBe('test');
      expect(responses[0]?.data.stop_reason).toBe('stop');
      expect(responses[0]?.data.usage.tokens.prompt).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.tokens.completion).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.tokens.total).toStrictEqual(
        responses[0]?.data.usage.tokens.prompt + responses[0]?.data.usage.tokens.completion,
      );
      expect(responses[0]?.data.usage.time_ms.to_first_token).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.time_ms.average_token).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.time_ms.total).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.time_ms.average_token).toStrictEqual(
        (responses[0]?.data.usage.time_ms.total - responses[0]?.data.usage.time_ms.to_first_token) /
          (responses[0]?.data.usage.tokens.completion - 1),
      );
      expect(responses[0]?.executionunits).toStrictEqual(
        serviceRate() +
          anthropicRates[model ?? 'claude-3-5-sonnet-20240620'](
            responses[0]?.data.usage.tokens.prompt ?? 0,
            responses[0]?.data.usage.tokens.completion ?? 0,
          ),
      );
      expect((responses[0]?.executionunits ?? 0) - serviceRate()).toStrictEqual(
        anthropicRates[model ?? 'claude-3-5-sonnet-20240620'](
          responses[0]?.data.usage.tokens.prompt ?? 0,
          responses[0]?.data.usage.tokens.completion ?? 0,
        ),
      );
    });
  }

  for (const model of [models[0]]) {
    it(`should limit the output of the model ${model} with a valid reason`, async () => {
      const event = createArvoEventFactory(contract.version('1.0.0')).accepts({
        subject: 'test',
        source: 'test',
        data: {
          model,
          max_tokens: 10,
          json_response: true,
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: 'List 5 animals. In JSON format {animals: string[]}',
            },
          ],
        },
      });

      const responses = await handler.execute(event, { inheritFrom: 'EVENT' });

      expect(responses.length).toBe(1);
      expect(responses[0]?.type).toBe('evt.anthropic.completions.success');
      expect(responses[0]?.subject).toBe('test');
      expect(responses[0]?.source).toBe('com.anthropic.completions');
      expect(responses[0]?.to).toBe('test');
      expect(responses[0]?.data.stop_reason).toBe('length');
      expect(responses[0]?.data.usage.tokens.prompt).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.tokens.completion).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.tokens.total).toStrictEqual(
        responses[0]?.data.usage.tokens.prompt + responses[0]?.data.usage.tokens.completion,
      );
      expect(responses[0]?.data.usage.time_ms.to_first_token).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.time_ms.average_token).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.time_ms.total).toBeGreaterThan(0);

      expect(responses[0]?.data.usage.time_ms.average_token).toStrictEqual(
        (responses[0]?.data.usage.time_ms.total - responses[0]?.data.usage.time_ms.to_first_token) /
          (responses[0]?.data.usage.tokens.completion - 1),
      );

      expect(() => JSON.parse(responses[0]?.data.message.content)).toThrow('Unexpected end of JSON input');
    });
  }

  for (const model of models) {
    it(`should return a valid JSON string response for a valid event with model ${model}`, async () => {
      const event = createArvoEventFactory(contract.version('1.0.0')).accepts({
        subject: 'test',
        source: 'test',
        data: {
          model,
          json_response: true,
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: 'List 5 animals. In JSON format {animals: string[]}',
            },
          ],
        },
      });

      const responses = await handler.execute(event, { inheritFrom: 'EVENT' });

      expect(responses.length).toBe(1);
      expect(responses[0]?.type).toBe('evt.anthropic.completions.success');
      expect(responses[0]?.subject).toBe('test');
      expect(responses[0]?.source).toBe('com.anthropic.completions');
      expect(responses[0]?.to).toBe('test');
      expect(responses[0]?.data.stop_reason).toBe('stop');
      expect(responses[0]?.data.usage.tokens.prompt).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.tokens.completion).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.tokens.total).toStrictEqual(
        responses[0]?.data.usage.tokens.prompt + responses[0]?.data.usage.tokens.completion,
      );
      expect(responses[0]?.data.usage.time_ms.to_first_token).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.time_ms.average_token).toBeGreaterThan(0);
      expect(responses[0]?.data.usage.time_ms.total).toBeGreaterThan(0);

      expect(responses[0]?.data.usage.time_ms.average_token).toStrictEqual(
        (responses[0]?.data.usage.time_ms.total - responses[0]?.data.usage.time_ms.to_first_token) /
          (responses[0]?.data.usage.tokens.completion - 1),
      );

      expect(() => JSON.parse(responses[0]?.data.message.content)).not.toThrow();

      const responseData = JSON.parse(responses[0]?.data.message.content);
      expect(responseData.animals.length).toBe(5);
    });
  }

  it('should return error event on invalid credentials', async () => {
    const event = createArvoEventFactory(contract.version('1.0.0')).accepts({
      subject: 'test',
      source: 'test',
      data: {
        model: models[0],
        json_response: true,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: 'List 5 animals. In JSON format {animals: string[]}',
          },
        ],
      },
    });

    const responses = await invalidHandler.execute(event, { inheritFrom: 'EVENT' });

    expect(responses.length).toBe(1);
    expect(responses[0]?.type).toBe('sys.com.anthropic.completions.error');
    expect(responses[0]?.subject).toBe('test');
    expect(responses[0]?.source).toBe('com.anthropic.completions');
    expect(responses[0]?.to).toBe('test');

    expect(responses[0]?.data.errorName).toBe('Error');
    expect(responses[0]?.data.errorMessage).toBe(
      '401 {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}',
    );
    expect(responses[0]?.data.errorStack).toBeDefined();

    expect(responses[0]?.executionunits).toBe(serviceRate());
  });
});
