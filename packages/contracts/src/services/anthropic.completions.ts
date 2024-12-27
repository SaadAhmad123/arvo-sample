import { createSimpleArvoContract } from 'arvo-core';
import { z } from 'zod';
import { anthropic } from '../commons/genai.llms.js';
import * as BaseGenAISchema from '../commons/schema.base.genai.js';

export const anthropicCompletions = createSimpleArvoContract({
  uri: '#/services/anthropic/completions',
  type: 'anthropic.completions',
  versions: {
    '1.0.0': {
      accepts: BaseGenAISchema.accept.merge(
        z.object({
          model: anthropic.optional().default('claude-3-haiku-20240307'),
        }),
      ),
      emits: BaseGenAISchema.emit,
    },
  },
});
