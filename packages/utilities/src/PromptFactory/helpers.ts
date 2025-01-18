import type z from 'zod';
import PromptFactory from './index.js';

/**
 * Helper function to create a PromptFactory instance
 * @example
 * const factory = createPromptFactory(
 *   z.object({ name: z.string() }),
 *   (data) => `Hello ${data.name}`
 * )
 */
export const createPromptFactory = <TSchema extends z.AnyZodObject>(
  schema: TSchema,
  factory: (data: z.infer<TSchema>) => string,
) => new PromptFactory({ schema, factory });
