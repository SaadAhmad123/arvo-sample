import { setupArvoMachine } from 'arvo-xstate';
import { reflectorAgentOrchestrator, llmOrchestrator } from '@repo/contracts/orchestrators';
import type { Generation, ReflectorAgentContext } from './types.js';
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
      const latestGeneration = context.generations[context.generations.length - 1]
      if (!latestGeneration) return true;
      return latestGeneration.evaluation_score >= context.configuration.criteria_satisfaction_threshold
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
          rawGenerations: [...context.rawGenerations, {
            valid_json: event.data.result.json_valid,
            content: event.data.result.message.content,
            total_tokens: event.data.result.usage.tokens.total
          }],
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
        if (!context.rawGenerations[context.rawGenerations.length - 1]) return context;
        const generationCritique = parsedResponse.data.analysis.map((item) => ({
          criterion: context.configuration.criteria[item.id] ?? '',
          satisfied: item.satisfied,
          improvement: item.improvement,
        }))
        const evaluationScore = generationCritique.length ? generationCritique.filter(item => item.satisfied).length / generationCritique.length : 1
        const rawGeneration = context.rawGenerations[context.rawGenerations.length - 1]!
        const generation: Generation = {
          content: rawGeneration.content,
          critique: generationCritique,
          total_token_usage: {
            generation: rawGeneration.total_tokens,
            critique: event.data.result.usage.tokens.total,
          },
          evaluation_score: evaluationScore,
          valid_json: rawGeneration.valid_json
        }

        return {
          generations: [
            ...context.generations, generation
          ]
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
    currentIteration: 0,
    maxIterations: input.data.max_iterations,
    tokenUsage: {},
    rawGenerations: []
  }),
  output: ({ context }) => {
    try {
      if (!context.status || context.status === 'error' || context.errors.length) {
        throw new Error("Error(s) occured in the process")
      }
      if (!context.generations[0]) {
        throw new Error("No generation generated during the process")
      }
      // With >=, if all the values are the same then the latest record will be picked. With > it will be the first record and due to the
      // nature of refinement every successive generation will be better than the last for the most part
      const bestGeneration = context.generations.reduce((acc, cur) => cur.evaluation_score >= acc.evaluation_score ? cur : acc, context.generations[0])
      return {
        status: 'success',
        errors: context.errors,
        result: {
          total_token_usage: context.generations.reduce((acc, cur) => acc + cur.total_token_usage.critique + cur.total_token_usage.generation, 0),
          json_valid: bestGeneration.valid_json,
          generations: context.generations,
          best_generation: bestGeneration,
        }
      };
    } catch (e) {
      return {
        status: 'error',
        errors: [
          ...context.errors,
          {
            errorName: 'OUTPUT_GENERATION_ERROR',
            errorMessage: `Error occurred while compiling the reflector agent final output. ${(e as Error).message}`,
            errorStack: null,
          },
        ],
        result: null,
      };
    }
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
