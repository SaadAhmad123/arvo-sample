import { setupArvoMachine } from 'arvo-xstate';
import { reflectorAgentOrchestrator, llmOrchestrator } from '@repo/contracts/orchestrators';
import type { ReflectorAgentContext } from './types.js';
import type z from 'zod';
import { assign, emit } from 'xstate';
import { createCriticEvent, CriticResponseSchema } from './utils/createCriticEvent.js';
import { createGeneratorEvent } from './utils/createGeneratorEvent.js';
import type { ArvoErrorType } from 'arvo-core';

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
    isCriteriaAchieved: ({ context }) => {
      if (!context.configuration.criteria.length) return true;
      const latestCritiques = context.critiques[context.critiques.length - 1];
      if (!latestCritiques) return false;
      const satisfiedCritiques = latestCritiques.filter((item) => item.satisfied);
      const currentSatisfactionPercentage = satisfiedCritiques.length / latestCritiques.length;
      return currentSatisfactionPercentage >= context.configuration.criteria_satisfaction_threshold;
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
  /** @xstate-layout N4IgpgJg5mDOIC5QCcwDMA2YDGAXA9sgIIwB2uAsgIbYAWAlqWAGoCMADOwHRljJUFkAYirIAbvi6FsXDBgC2XCPiYBtdgF1EoAA75Y9XPRXaQAD0QBmVgDYuAdlYAOezctPWAVgAs3y94AaEABPK28AJi5Ldm8bGwBOdnjrTxt7AF90oNRMHEESMHJqOkYWDm5efkERcUlpWQUlFTBVVi0kED0DIxMOiwRrO0cXNw8fP0CQxA8ub3j5p094+3ZWa29M7PQsPEICopoGJjZOHkK+AUIhWGDYLlEJKWQZOUU+ZEJ1dt19Q2NSUz9QYOZyudxeXz+IKhBCsez2WaeayscL2cLsGzhJYZLIgHI7fJkSiHUonbjYZB-bA1R71V5NNSaUxdP69UD9RbcVLhObOeJLOL2aGITworhOSxLcL8+I2JyYyybPHbPJ7InFI5lU4Uqk0urPBqKZRqNrM349AF9aaeLmY3lOGWC4UIby2cVOcJOdie2KWNJOJX41XEdUk47lLg6ozUm53B76l6Nd6fJkdFkWwHW208+J8gVpZ2WdFceLStI2JKeFxFwMq3YhwrEkrh04fACuuDAQi+Zu6-0zsMl8S43s8qXYrnskvYnkL3k8JYxPJsovs88sitxQfr+ybmrJXHbne7prT5v7VsHY5H3rhruWrvCzu8DtmrHinPnNvYRZstdyO6hs2WrcEeXaqOE3ydOebLmIgaweuK86lu+SRuL4zoJE44p8ii8LhCung4ripD4BAcCmNuhKNhqpLlL2rKWuyiAALQ2M6bE3pwqLhKwcKeLxY7-gSao0WGIFnEwVSEAxGaXhEzocJE5ZjnM7BOF+0rCcGu60S25KUtGskXsxCCYtwvEuC+nDqTEQpTAMEQjtYy7eFOEqONpgFicBB5gcZsH9CiSJRBu0RekkM4xM6PisFwNjzh6rB+GFcpedRBy+RGxpgAFTFwbCSwLj4coJTaGk+jFboOlW1jzOEli5puWwARle50acybIHlA4ojyI7JGiG4fmkpaKYsXDhGW9jyrKVbxPOmSZEAA */
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
          guard: { type: 'isCriteriaAchieved' },
        },
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
