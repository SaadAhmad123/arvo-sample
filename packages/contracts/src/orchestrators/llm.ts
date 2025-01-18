import { createArvoOrchestratorContract, createArvoOrchestratorEventFactory } from 'arvo-core';
import { z } from 'zod';
import * as LLMs from '../commons/genai.llms.js';
import * as BaseGenAISchema from '../commons/schema.base.genai.js';
import { createOrchestratorCompletionSchema } from '../commons/schema.orchestrator.complete.js';

export const llmModelSchema = z.union([
  z.object({
    provider: z.literal('anthropic'),
    model: LLMs.anthropic.default('claude-3-haiku-20240307'),
  }),
  z.object({
    provider: z.literal('openai'),
    model: LLMs.openai.default('gpt-4o-mini'),
  }),
]);

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

const factory = createArvoOrchestratorEventFactory(llmOrchestrator.version('1.0.0'));

const event = factory.systemError({
  source: 'com.test.test',
  subject: 'test-subject',
  error: new Error('Some error'),
});
