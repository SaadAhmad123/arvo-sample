import { exceptionToSpan } from 'arvo-core';
import { z } from 'zod';

const defaultZodObject = z.record(z.string(), z.any());
/**
 * Parses and validates a JSON string using Zod schema.
 *
 * @template T - The type defined by the Zod schema
 * @param str - The JSON string to parse
 * @param [schema] - Optional Zod schema to validate the parsed data. Default is z.record(z.string(), z.any())
 * @returns The parsed and validated data of type T, or null if parsing/validation fails
 *
 * @example
 * ```typescript
 * const UserSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * // Type is inferred from schema
 * const user = parseJSON('{"id": 1, "name": "John", "email": "john@example.com"}', UserSchema);
 * if (user) {
 *   console.log(user.email); // TypeScript knows email exists and is string
 * }
 * ```
 *
 * @remarks
 * - Combines JSON parsing with Zod schema validation
 * - Returns null on both parsing and validation errors
 * - All errors are converted to spans via exceptionToSpan
 */
export const parseJSON = <T extends z.ZodTypeAny = typeof defaultZodObject>(
  str: string,
  schema: T = defaultZodObject as unknown as T,
): z.infer<T> | null => {
  try {
    const parsed = JSON.parse(str);
    const validated = schema.parse(parsed);
    return validated;
  } catch (e) {
    exceptionToSpan(e instanceof Error ? e : new Error(String(e)));
    return null;
  }
};
