import * as ServiceContracts from '@repo/contracts/services';
import { type InferVersionedArvoContract, type VersionedArvoContract, createArvoEventFactory } from 'arvo-core';
import * as dotenv from 'dotenv';
import { openaiRates } from '../src/commons/ratecards/openai.js';
import { serviceRate } from '../src/commons/ratecards/service.js';
import * as ServiceFactories from '../src/index.js';
import { getMockSettingsFactory } from './mock.settings.js';
import { telemetrySdkStart, telemetrySdkStop } from './otel.js';
dotenv.config();

describe('openai.completions', () => {
  beforeAll(async () => {
    await telemetrySdkStart();
  });

  afterAll(async () => {
    await telemetrySdkStop();
  });

  const handler = ServiceFactories.openaiCompletions({
    settings: getMockSettingsFactory(),
  });
  const invalidHandler = ServiceFactories.openaiCompletions({
    settings: getMockSettingsFactory(true),
  });

  const contract = ServiceContracts.openaiCompletions;
  const models: InferVersionedArvoContract<
    VersionedArvoContract<typeof contract, '1.0.0'>
  >['accepts']['data']['model'][] = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'];

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
      expect(responses[0]?.type).toBe('evt.openai.completions.success');
      expect(responses[0]?.subject).toBe('test');
      expect(responses[0]?.source).toBe('com.openai.completions');
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
          openaiRates[model ?? 'gpt-4-turbo'](
            responses[0]?.data.usage.tokens.prompt ?? 0,
            responses[0]?.data.usage.tokens.completion ?? 0,
          ),
      );
      expect((responses[0]?.executionunits ?? 0) - serviceRate()).toStrictEqual(
        openaiRates[model ?? 'gpt-4-turbo'](
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
      expect(responses[0]?.type).toBe('evt.openai.completions.success');
      expect(responses[0]?.subject).toBe('test');
      expect(responses[0]?.source).toBe('com.openai.completions');
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
      expect(responses[0]?.type).toBe('evt.openai.completions.success');
      expect(responses[0]?.subject).toBe('test');
      expect(responses[0]?.source).toBe('com.openai.completions');
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
    expect(responses[0]?.type).toBe('sys.com.openai.completions.error');
    expect(responses[0]?.subject).toBe('test');
    expect(responses[0]?.source).toBe('com.openai.completions');
    expect(responses[0]?.to).toBe('test');

    expect(responses[0]?.data.errorName).toBe('Error');
    expect(responses[0]?.data.errorMessage).toBe(
      '401 Incorrect API key provided: MOCK. You can find your API key at https://platform.openai.com/account/api-keys.',
    );
    expect(responses[0]?.data.errorStack).toBeDefined();

    expect(responses[0]?.executionunits).toBe(serviceRate());
  });
});
