export const anthropicRates = {
  'claude-3-opus-20240229': (inputTokens: number, outputTokens: number) => {
    return (inputTokens * 15) / 1e6 + (outputTokens * 75) / 1e6;
  },
  'claude-3-sonnet-20240229': (inputTokens: number, outputTokens: number) => {
    return (inputTokens * 3) / 1e6 + (outputTokens * 15) / 1e6;
  },
  'claude-3-haiku-20240307': (inputTokens: number, outputTokens: number) => {
    return (inputTokens * 0.25) / 1e6 + (outputTokens * 1.25) / 1e6;
  },
  'claude-3-5-sonnet-20240620': (inputTokens: number, outputTokens: number) => {
    return (inputTokens * 3) / 1e6 + (outputTokens * 15) / 1e6;
  },
};
