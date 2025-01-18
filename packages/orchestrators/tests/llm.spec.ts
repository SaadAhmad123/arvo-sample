import { llmOrchestrator as llmOrchestratorContract } from '@repo/contracts/orchestrators';
import * as serviceContracts from '@repo/contracts/services';
import { createArvoEventFactory, createArvoOrchestratorEventFactory } from 'arvo-core';
import { SimpleMachineMemory } from 'arvo-xstate';
import { llmOrchestrator } from '../src/index.js';
import { expectOrchestratedEvent, mockArvoEventHandler } from './utils/index.js';
import { telemetrySdkStart, telemetrySdkStop } from './utils/otel.js';

describe('LLM Orchestrator', () => {
  const memory = new SimpleMachineMemory();
  const handler = llmOrchestrator(memory);

  beforeAll(async () => {
    await telemetrySdkStart();
  });

  afterAll(async () => {
    await telemetrySdkStop();
  });

  it('should successfully emit openai event for openai init event', async () => {
    memory.clear();
    const initEvent = createArvoOrchestratorEventFactory(llmOrchestratorContract.version('1.0.0')).init({
      source: 'com.test.test',
      data: {
        parentSubject$$: null,
        model: {
          provider: 'openai',
        },
        messages: [
          {
            role: 'user',
            content: 'Hello world',
          },
        ],
      },
    });

    const events = await handler.execute(initEvent, { inheritFrom: 'EVENT' });

    expect(events.length).toBe(1);
    expectOrchestratedEvent(events[0], {
      orchestrator: llmOrchestratorContract.version('1.0.0'),
      service: serviceContracts.openaiCompletions.version('1.0.0'),
    });
  });

  it('should successfully emit anthropic event for anthropic init event', async () => {
    memory.clear();
    const initEvent = createArvoOrchestratorEventFactory(llmOrchestratorContract.version('1.0.0')).init({
      source: 'com.test.test',
      data: {
        parentSubject$$: null,
        model: {
          provider: 'anthropic',
        },
        messages: [
          {
            role: 'user',
            content: 'Hello world',
          },
        ],
      },
    });

    const events = await handler.execute(initEvent, { inheritFrom: 'EVENT' });

    expect(events.length).toBe(1);
    expectOrchestratedEvent(events[0], {
      orchestrator: llmOrchestratorContract.version('1.0.0'),
      service: serviceContracts.anthropicCompletions.version('1.0.0'),
    });
  });

  it('should successfully emit done event on a valid response from llm', async () => {
    memory.clear();
    const mockAnthropicHandler = mockArvoEventHandler(serviceContracts.anthropicCompletions);
    const initEvent = createArvoOrchestratorEventFactory(llmOrchestratorContract.version('1.0.0')).init({
      source: 'com.test.test',
      data: {
        parentSubject$$: null,
        model: {
          provider: 'anthropic',
        },
        messages: [
          {
            role: 'user',
            content: 'Hello world',
          },
        ],
      },
    });

    let events = await handler.execute(initEvent, { inheritFrom: 'EVENT' });

    expect(events.length).toBe(1);
    expectOrchestratedEvent(events[0], {
      orchestrator: llmOrchestratorContract.version('1.0.0'),
      service: serviceContracts.anthropicCompletions.version('1.0.0'),
    });

    // biome-ignore lint/style/noNonNullAssertion: Very sure that it in not null
    events = await mockAnthropicHandler.execute(events[0]!, { inheritFrom: 'EVENT' });
    events = events.filter((item) => item.type === 'evt.anthropic.completions.success');
    expect(events.length).toBe(1);

    // biome-ignore lint/style/noNonNullAssertion: Very sure that it in not null
    events = await handler.execute(events[0]!, { inheritFrom: 'EVENT' });
    expect(events.length).toBe(1);

    expect(events[0]?.type).toBe('arvo.orc.llm.done');
    expect(events[0]?.to).toBe('com.test.test');
    expect(events[0]?.source).toBe('arvo.orc.llm');
    expect(llmOrchestratorContract.version('1.0.0').emits['arvo.orc.llm.done'].safeParse(events[0]?.data).success).toBe(
      true,
    );
  });

  it('should successfully emit error done event on a error response from llm', async () => {
    memory.clear();
    const initEvent = createArvoOrchestratorEventFactory(llmOrchestratorContract.version('1.0.0')).init({
      source: 'com.test.test',
      data: {
        parentSubject$$: null,
        model: {
          provider: 'anthropic',
        },
        messages: [
          {
            role: 'user',
            content: 'Hello world',
          },
        ],
      },
    });

    let events = await handler.execute(initEvent, { inheritFrom: 'EVENT' });

    expect(events.length).toBe(1);
    expectOrchestratedEvent(events[0], {
      orchestrator: llmOrchestratorContract.version('1.0.0'),
      service: serviceContracts.anthropicCompletions.version('1.0.0'),
    });

    const errorEvent = createArvoEventFactory(serviceContracts.anthropicCompletions.version('1.0.0')).systemError({
      subject: initEvent.subject,
      source: serviceContracts.anthropicCompletions.version('1.0.0').accepts.type,
      to: llmOrchestratorContract.version('1.0.0').accepts.type,
      error: new Error('Test Error'),
      traceparent: events[0]?.traceparent ?? undefined,
      tracestate: events[0]?.tracestate ?? undefined,
    });

    events = await handler.execute(errorEvent, { inheritFrom: 'EVENT' });
    expect(events.length).toBe(1);

    expect(events[0]?.type).toBe('arvo.orc.llm.done');
    expect(events[0]?.to).toBe('com.test.test');
    expect(events[0]?.source).toBe('arvo.orc.llm');
    expect(llmOrchestratorContract.version('1.0.0').emits['arvo.orc.llm.done'].safeParse(events[0]?.data).success).toBe(
      true,
    );
    expect(events[0]?.data?.status).toBe('error');
    expect(events[0]?.data?.errors[0]?.errorName).toBe('Error');
    expect(events[0]?.data?.errors[0]?.errorMessage).toBe('Test Error');
  });
});
