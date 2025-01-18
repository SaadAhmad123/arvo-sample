import type { z } from 'zod';

/** Parameters for PromptFactory initialization */
export type PromptFactoryParams<TSchema extends z.AnyZodObject> = {
  schema: TSchema;
  factory: (data: z.input<TSchema>) => string;
};
