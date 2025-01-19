import { createArvoContract } from 'arvo-core';
import { z } from 'zod';

export const llmCompletionStream = createArvoContract({
  uri: '#/streams/llm/completions',
  type: 'stream.llm.completions',
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
