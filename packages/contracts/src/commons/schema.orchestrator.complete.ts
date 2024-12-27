import { ArvoErrorSchema } from 'arvo-core';
import { z } from 'zod';

/**
 * Creates a schema for orchestrator completions that handles both success and error cases.
 *
 * @param schema - Zod schema defining the structure of successful response data
 * @returns A Zod schema validating objects containing status, errors, and typed result
 *
 * @example
 * // Define data schema
 * const DataSchema = z.object({
 *   value: z.string()
 * })
 *
 * // Create completion schema
 * const CompletionSchema = createOrchestratorCompletionSchema(DataSchema)
 *
 * // Validates objects with shape:
 * type Completion = z.infer<typeof CompletionSchema>
 * // {
 * //   status: 'success' | 'error'
 * //   errors: ArvoError[] | null
 * //   result: { value: string } | null
 * // }
 */
export const createOrchestratorCompletionSchema = <T extends z.AnyZodObject>(schema: T) => {
  return z.object({
    status: z.enum(['success', 'error']),
    errors: ArvoErrorSchema.array().nullable(),
    result: schema.nullable(),
  });
};
