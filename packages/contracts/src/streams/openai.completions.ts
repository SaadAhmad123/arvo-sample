import { createArvoContract } from 'arvo-core';
import { z } from 'zod';

export const openaiCompletionStream = createArvoContract({
  uri: '#/steams/openai/completions',
  type: 'stream.openai.completions',
  versions: {
    '1.0.0': {
      accepts: z.object({
        delta: z.string(),
        text: z.string(),
      }),
      emits: {},
    },
  },
});
