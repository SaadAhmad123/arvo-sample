import { llmOrchestrator, reflectorAgentOrchestrator } from '@repo/contracts/orchestrators';
import type { ArvoErrorType } from 'arvo-core';
import { setupArvoMachine } from 'arvo-xstate';
import { assign, emit } from 'xstate';
import type z from 'zod';
import type { ReflectorAgentContext } from './types.js';
import { CriticResponseSchema, createCriticEvent } from './utils/createCriticEvent.js';
import { createGeneratorEvent } from './utils/createGeneratorEvent.js';

const machineId = 'reflectorAgentMachineV100';
export const reflectorAgentMachineV100 = setupArvoMachine({
  contracts: {
    self: reflectorAgentOrchestrator.version('1.0.0'),
    services: {
      llm: llmOrchestrator.version('1.0.0'),
    },
  },
  types: {
    context: {} as ReflectorAgentContext,
  },
  guards: {
    isMaxIteration: ({ context }) => !(context.currentIteration < context.maxIterations),
    isLLMResponseValid: ({ event }, param?: z.ZodTypeAny) => {
      if (
        event.type === 'arvo.orc.llm.done' &&
        event.data.status === 'success' &&
        event.data.result?.json_valid === true
      ) {
        return param ? param.safeParse(JSON.parse(event.data.result.message.content)).success : true;
      }
      return false;
    },
  },
  actions: {
    setStatus: assign({ status: (_, param: 'error' | 'success') => param }),
    incrementIteration: assign({
      currentIteration: ({ context }) => context.currentIteration + 1,
    }),
    appendError: assign({
      errors: ({ context, event }, param?: ArvoErrorType) => {
        let errors = context.errors;
        if (event.type === 'sys.arvo.orc.llm.error') {
          errors = [...errors, event.data];
        }
        if (event.type === 'arvo.orc.llm.done' && event.data.status === 'error') {
          errors = [...errors, ...(event.data.errors ?? [])];
        }
        if (param) {
          errors = [...errors, param];
        }
        return errors;
      },
    }),
    emitGeneratorEvent: emit(({ context }) => createGeneratorEvent(context)),
    setGeneratorResponse: assign(({ context, event }) => {
      if (event.type === 'arvo.orc.llm.done' && event.data.status === 'success' && event.data.result) {
        return {
          json_valid: event.data.result.json_valid,
          generations: [...context.generations, event.data.result?.message.content],
          tokenUsage: {
            ...context.tokenUsage,
            [`generator.${context.currentIteration}`]: event.data.result.usage.tokens.total,
          },
        };
      }
      return context;
    }),
    emitCriticEvent: emit(({ context }) => createCriticEvent(context)),
    setCriticResponse: assign(({ context, event }) => {
      if (
        event.type === 'arvo.orc.llm.done' &&
        event.data.status === 'success' &&
        event.data.result?.json_valid === true
      ) {
        const parsedResponse = CriticResponseSchema.safeParse(JSON.parse(event.data.result.message.content));
        if (!parsedResponse.success) return context;
        return {
          critiques: [
            ...context.critiques,
            parsedResponse.data.analysis.map((item) => ({
              criterion: context.configuration.criteria[item.id] ?? '',
              satisfied: item.satisfied,
              improvement: item.improvement,
            })),
          ],
          tokenUsage: {
            ...context.tokenUsage,
            [`critic.${context.currentIteration}`]: event.data.result.usage.tokens.total,
          },
        };
      }
      return context;
    }),
    setLLMResponseInvalidError: assign({
      errors: ({ context, event }, param?: z.ZodTypeAny) => {
        if (event.type === 'arvo.orc.llm.done') {
          if (event.data.status === 'success' && event.data.result) {
            if (!event.data.result.json_valid) {
              return [
                ...context.errors,
                {
                  errorName: 'LLM_INVALID_JSON',
                  errorMessage: 'The LLM response is not a valid JSON object',
                  errorStack: null,
                },
              ];
            }
            if (param) {
              const result = param.safeParse(JSON.parse(event.data.result.message.content));
              if (result.error) {
                return [
                  ...context.errors,
                  {
                    errorName: 'LLM_JSON_SCHEMA_VIOLATION',
                    errorMessage: result.error.message,
                    errorStack: null,
                  },
                ];
              }
            }
          } else {
            return [...context.errors, ...(event.data.errors ?? [])];
          }
        }
        return context.errors;
      },
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGBjAFgSwHZgDoZ8AnVAFwHsSBiVEgN0oOvQIBt3kCJL8BtAAwBdRKAAOlWNnLY+YkAA9EAJgAcAFgIA2AIyDBugJxHBGgMwaVGjQBoQAT0SWVBNWe0BWXWqMrPAOwangC+IfZoWHiExGBkVLT0TCwkbJzcvAK6okggktKy8rnKCOae5gQGurrm+poqKuZGAfZOCJoEGkZq3hq+nmp6AaHhIJE4+ERgpBTUNLAOsARJzKwcXARxJNRCORJSMnK4CiW6AdoERtpXGvplGtpBaq2IxhfBgWfVgurmgiMRDATQjoEiHdB0RirVLrDJ8MC7BT5Q5FUAlXxqAjVLplR79QwvBDacwBSraQy+IyWczqNRhQFRSag8GQ5JrdI8eH8bJIg6FY7FV4qAJGNwBNRlbxqRraR6EsqYjQBcWeRoigLmNTDeljIHRAjM2QQhZLFYpNIbLY7ES8gpHE6vQTEggqIyeK64gJnTyeQnqQQu-x+L3Kp1egG6xmEbYAV3IYBoiNyyP5DoQuj6nixg3Meg9jxqhNlrkEuY1ZiMfUMOvG+tj8cTPOTfPtgvTglMbl8Xv05WVRkJ0oDxJJVO6ul+dJ1uEoEDgClr+FtKIFaMQAFofFo-N0vIIRV0BnZHBv3S6TIYak9PKWVDW9ZNYvFqMvU23N7nLq7BjeD27NISPiuNo0rWA0dTWMS95RgaYJGq+rZrkSyqVJ4Xg+AMjSagOJ6lJ+fyuj6TQTtUU4MsCBD1mACGokoryWLoLqqo0N4diYLS4V4orio8lY3jYXp3qMi6EJk1HNnatGnEEFQ3m65wGEYuhoUWZSVGWPTdI0BhCeR+pWiQNGrnR6a5loTSVnoPQqN6zy4eoLqGDp7gan4YRhEAA */
  id: machineId,
  context: ({ input }) => ({
    initSubject$$: input.subject,
    status: null,
    configuration: input.data,
    errors: [],
    generations: [],
    critiques: [],
    currentIteration: 0,
    maxIterations: input.data.max_iterations,
    tokenUsage: {},
    json_valid: null,
  }),
  output: ({ context }) => {
    return {
      status: context.status ?? 'error',
      errors: context.errors,
      result:
        context.status === 'success'
          ? {
              critiques: context.critiques,
              token_usage: context.tokenUsage,
              json_valid: context.json_valid,
              generations: context.generations,
            }
          : null,
    };
  },
  initial: 'generator',
  states: {
    generator: {
      entry: [{ type: 'incrementIteration' }, { type: 'emitGeneratorEvent' }],
      on: {
        'arvo.orc.llm.done': [
          {
            target: 'critic',
            guard: ({ event }) => event.type === 'arvo.orc.llm.done' && event.data.status === 'success',
            actions: { type: 'setGeneratorResponse' },
          },
          {
            target: 'error',
            actions: { type: 'setLLMResponseInvalidError' },
          },
        ],
        'sys.arvo.orc.llm.error': {
          target: 'error',
          actions: { type: 'appendError' },
        },
      },
    },
    critic: {
      entry: { type: 'emitCriticEvent' },
      on: {
        'arvo.orc.llm.done': [
          {
            target: 'route',
            guard: { type: 'isLLMResponseValid', params: CriticResponseSchema },
            actions: { type: 'setCriticResponse' },
          },
          {
            target: 'error',
            actions: {
              type: 'setLLMResponseInvalidError',
              params: CriticResponseSchema,
            },
          },
        ],
        'sys.arvo.orc.llm.error': {
          target: 'error',
          actions: { type: 'appendError' },
        },
      },
    },
    route: {
      always: [
        {
          target: 'done',
          guard: { type: 'isMaxIteration' },
        },
        {
          target: 'generator',
        },
      ],
    },
    done: {
      type: 'final',
      entry: {
        type: 'setStatus',
        params: 'success',
      },
    },
    error: {
      type: 'final',
      entry: {
        type: 'setStatus',
        params: 'error',
      },
    },
  },
});
