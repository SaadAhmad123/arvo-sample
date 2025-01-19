import {} from 'arvo-core';
import { z } from 'zod';
import * as LLMs from '../../commons/genai.llms.js';

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
