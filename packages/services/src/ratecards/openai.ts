import type { LLMModels } from '@repo/contracts/genaiModels';

export const openaiRates: Record<
  (typeof LLMModels)['openai'][number],
  (inputTokens: number, outputTokens: number) => number
> = {
  'gpt-4-turbo': (inputTokens: number, outputTokens: number) => {
    return (inputTokens * 10) / 1e6 + (outputTokens * 30) / 1e6;
  },
  'gpt-4o': (inputTokens: number, outputTokens: number) => {
    return (inputTokens * 2.5) / 1e6 + (outputTokens * 10) / 1e6;
  },
  'gpt-4o-mini': (inputTokens: number, outputTokens: number) => {
    return (inputTokens * 0.15) / 1e6 + (outputTokens * 0.6) / 1e6;
  },
};
