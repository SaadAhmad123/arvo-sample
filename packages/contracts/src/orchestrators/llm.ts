import { createArvoOrchestratorContract } from 'arvo-core';
import { z } from 'zod';
import * as BaseGenAISchema from '../commons/schema.base.genai.js';
import { createOrchestratorCompletionSchema } from '../commons/schema.orchestrator.complete.js';
import { llmModelSchema } from './commons/llmModelSchema.js';

export const llmOrchestrator = createArvoOrchestratorContract({
  uri: '#/orchestrators/llm',
  name: 'llm',
  versions: {
    '1.0.0': {
      init: BaseGenAISchema.accept.merge(
        z.object({
          model: llmModelSchema,
        }),
      ),
      complete: createOrchestratorCompletionSchema(
        BaseGenAISchema.emit.merge(
          z.object({
            model: llmModelSchema,
          }),
        ),
      ),
    },
  },
});
