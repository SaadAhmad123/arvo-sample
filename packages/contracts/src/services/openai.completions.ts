import { createSimpleArvoContract } from 'arvo-core';
import { z } from 'zod';
import { openai } from '../commons/genai.llms.js';
import * as BaseGenAISchema from '../commons/schema.base.genai.js';

export const openaiCompletions = createSimpleArvoContract({
  uri: '#/services/openai/completions',
  type: 'openai.completions',
  versions: {
    '1.0.0': {
      accepts: BaseGenAISchema.accept.merge(
        z.object({
          model: openai.default('gpt-4o-mini'),
        }),
      ),
      emits: BaseGenAISchema.emit,
    },
  },
});
