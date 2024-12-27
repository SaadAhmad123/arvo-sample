import type { z } from 'zod';
import type { PromptFactoryParams } from './types.js';

/**
 * Factory for building typed prompts with validated data
 *
 * @example
 * const factory = new PromptFactory({
 *   schema: z.object({ name: z.string() }),
 *   factory: (data) => `Hello ${data.name}`
 * })
 *
 * factory.build({ name: "John" }) // "Hello John"
 */
export default class PromptFactory<TSchema extends z.AnyZodObject> {
  private readonly schema: TSchema;
  private readonly factory: (data: z.input<TSchema>) => string;

  constructor({ schema, factory }: PromptFactoryParams<TSchema>) {
    this.schema = schema;
    this.factory = factory;
  }

  /**
   * Builds prompt from validated data
   * @throws Error if validation fails
   */
  build(data: z.input<TSchema>): string {
    const result = this.schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Prompt factory unable to build the prompt due to invalid data. Error: ${result.error.message}`);
    }
    return this.factory(data);
  }
}
