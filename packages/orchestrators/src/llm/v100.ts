import { llmOrchestrator } from '@repo/contracts/orchestrators';
import { anthropicCompletions, openaiCompletions } from '@repo/contracts/services';
import type { ArvoErrorType, InferVersionedArvoContract, VersionedArvoContract } from 'arvo-core';
import { setupArvoMachine, xstate } from 'arvo-xstate';
import type { LLMModels } from '@repo/contracts/genaiModels';

type LLMMachineV100Context = {
  data: InferVersionedArvoContract<VersionedArvoContract<typeof llmOrchestrator, '1.0.0'>>['accepts']['data'];
  result: InferVersionedArvoContract<
    VersionedArvoContract<typeof llmOrchestrator, '1.0.0'>
  >['emits']['arvo.orc.llm.done']['data']['result'];
  errors: ArvoErrorType[];
};

const machineId = 'llmMachineV100';
export const llmMachineV100 = setupArvoMachine({
  contracts: {
    self: llmOrchestrator.version('1.0.0'),
    services: {
      openai: openaiCompletions.version('1.0.0'),
      anthropic: anthropicCompletions.version('1.0.0'),
    },
  },
  types: {
    context: {} as LLMMachineV100Context,
  },
  guards: {
    isOpenAI: ({ context }) => context.data.model.provider === 'openai',
    isAnthropic: ({ context }) => context.data.model.provider === 'anthropic',
  },
  actions: {
    appendError: xstate.assign({
      errors: ({ context, event }, param?: ArvoErrorType) => {
        let allErrors: ArvoErrorType[] = [...context.errors];
        if (param) {
          allErrors = [...allErrors, param];
        }
        if (event.type === 'sys.com.anthropic.completions.error') {
          allErrors = [...allErrors, event.data];
        }
        if (event.type === 'sys.com.openai.completions.error') {
          allErrors = [...allErrors, event.data];
        }
        return allErrors;
      },
    }),
    assignResult: xstate.assign({
      result: ({ context, event }) => {
        if (event.type === 'evt.openai.completions.success' || event.type === 'evt.anthropic.completions.success') {
          return {
            ...event.data,
            model: context.data.model,
          };
        }
        return context.result;
      },
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBtkFsCyBDAxgCwEsA7MANQEYAGSgOgCcB7AVwBcw6BiAbUoF1FQABwawCLAgyICQAD0TkArLQDM5AEwAWAGwKAHFq2UAnAHYNAGhABPRGrVaadnRt3Kj7jQrsBfb5dSYuIQkFNT0zGycXOT8SCDCouKS0nII5Io0ChpqRsra5IamFtaIymo0lAZu2iaUCqpaar7+6Nj4xGRUtIys7NxqsUIiYhJScamKKuraegbGZpY2CF4aNFplJvZ6yrpUys0gAW3BnWEMgmBEWAQcYABuLDTnl9c0OAxogshgSUSwNLAmDgcHBYDxBvFhr8UogtCYHLoFLl9FpyLl3FpFrYjOQaIjcgoDGo8hpjPs-IdWkEOqFaM8rjdYFZ-u80E8Lgy3h8vj9Rv92Iw6ODpAkRslxogNEYFJltLoUWi3EZ1liEJ5aJQ5cTGmpyBpyAcjtSQl0aFgiCw8IxBAQcLcHmaLVbzrauZ9vr9-oDgaDhXFRdCJcstKtdEZdBopel0crVQBadw0SP1RRGDQmIyajSGqntE1hc2W622jhMlkfR1Fl04N08z00AUMIV8EVQ0Yw5ZKGjKBSKMzRpWYkppEyOVG1LJh3KURW+ClEBgQODSI1506UVuJdtBuNDpZx8j6GhplNI9OZyNNCmrk608K9OibsVjUCpbKq9S6NYzhQKTZw6VlBDHNAjXO96WuJ9A1fUpKC-bI-2lVFNRxYolhyXE4KRNRanIZQ8gzbNr1zW9TULZ0bRwKDtxghAyi-MpKDKLR9BQvV4xDCp8R7NFKkaHsQOOGlTQgSQwGo8VaL2BwChnFxKDUXRjFMVVM0caUz2lMNPF2QTjXXBs6EFCSX1keQmIcEw9V2DRlGoeVEVVZQzBoEw-xMIDpQvBS528IA */
  id: machineId,
  context: ({ input }) => ({
    errors: [],
    result: null,
    data: input.data,
  }),
  output: ({ context }) => {
    let allErrors = [...context.errors];
    if (!context.result) {
      allErrors = [
        ...allErrors,
        {
          errorName: 'Error',
          errorMessage: 'Unable to generate a response from the LLM',
          errorStack: null,
        },
      ];
    }
    return {
      status: allErrors.length ? 'error' : 'success',
      result: context.result ?? null,
      errors: allErrors,
    };
  },
  initial: 'router',
  states: {
    router: {
      always: [
        {
          target: 'openai',
          guard: 'isOpenAI',
        },
        {
          target: 'anthropic',
          guard: 'isAnthropic',
        },
        {
          target: 'error',
          actions: {
            type: 'appendError',
            params: {
              errorName: 'Error',
              errorMessage: 'Invalid model required for generation',
              errorStack: null,
            },
          },
        },
      ],
    },
    openai: {
      entry: xstate.emit(({ context }) => ({
        type: 'com.openai.completions',
        data: {
          ...context.data,
          model: context.data.model.model as (typeof LLMModels)['openai'][number],
        },
      })),
      on: {
        'evt.openai.completions.success': {
          target: 'done',
          actions: 'assignResult',
        },
        'sys.com.openai.completions.error': {
          target: 'error',
          actions: 'appendError',
        },
      },
    },
    anthropic: {
      entry: xstate.emit(({ context }) => ({
        type: 'com.anthropic.completions',
        data: {
          ...context.data,
          model: context.data.model.model as (typeof LLMModels)['anthropic'][number],
        },
      })),
      on: {
        'evt.anthropic.completions.success': {
          target: 'done',
          actions: 'assignResult',
        },
        'sys.com.anthropic.completions.error': {
          target: 'error',
          actions: 'appendError',
        },
      },
    },
    done: {
      type: 'final',
    },
    error: {
      type: 'final',
    },
  },
});
