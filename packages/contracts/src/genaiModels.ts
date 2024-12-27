import type { z } from 'zod';
import * as LLMModelEnum from './commons/genai.llms.js';

const LLMModels = Object.fromEntries(
  Object.entries(LLMModelEnum).map(([key, value]) => [key, value.options]),
) as unknown as {
  [K in keyof typeof LLMModelEnum]: z.infer<(typeof LLMModelEnum)[K]>[];
};

export { LLMModelEnum, LLMModels };
