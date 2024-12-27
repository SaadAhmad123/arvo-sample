import { cleanString } from 'arvo-core';
import { z } from 'zod';

/**
 * Base schema definition for GenAI (Generative AI) operations.
 *
 * Defines the structure for both input (accept) and output (emit) schemas
 * used in GenAI operations. This schema in merge with operation specific
 * schema in the contracts.
 */
export const accept = z.object({
  max_tokens: z
    .number()
    .min(10, 'The minimum number of completion tokens must be 10')
    .max(4096, 'The maximum number of completion tokens must be 4096')
    .optional()
    .describe('The maximum output tokens.')
    .default(4096),

  system_command: z
    .string()
    .optional()
    .describe('The persona the large language model should assume for the request.')
    .default('You are a helpful assistant'),

  temperature: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('The extent of randomness assumed by the model to generate the output')
    .default(0.5),

  json_response: z
    .boolean()
    .optional()
    .describe('If set to `true`, the response will be in JSON format, if possible.')
    .default(false),

  messages: z
    .object({
      role: z.enum(['user', 'assistant']).describe('The source of the message either user or assistant (this AI).'),
      content: z.string().describe('The content of the message'),
    })
    .array()
    .min(1)
    .describe('A list of the messages to consider'),
});

export const emit = z.object({
  json_valid: z
    .boolean()
    .nullable()
    .describe(
      cleanString(`
    Indicates whether the model's inference output is a valid JSON object. When json_response is True, this field will be:
    - True: if inference output is valid JSON
    - False: if inference output is not valid JSON
    When json_response is False, this field defaults to Null.
  `),
    ),
  message: z
    .object({
      role: z.literal('assistant').describe('The source of the message either user or assistant (this AI).'),
      content: z.string().describe('The content of the message'),
    })
    .describe('The output message of the model'),

  usage: z.object({
    tokens: z
      .object({
        prompt: z.number(),
        completion: z.number(),
        total: z.number(),
      })
      .describe('The token usage of the model.'),

    time_ms: z
      .object({
        to_first_token: z.number().describe('Time taken by the model to generate the first token'),
        average_token: z.number().describe('The average time take by the model per token'),
        total: z.number().describe('The total time taken by the model to generate the response'),
      })
      .describe('The time in milliseconds to track the model performance'),
  }),

  stop_reason: z.enum(['stop', 'length', 'content_filter']).describe(
    cleanString(`
              The reason the model stopped its output:    
              - stop -> if the model hit a natural stop point or a provided stop sequence
              - length -> if the maximum number of tokens specified in the request was reached
              - content_filter -> if content was omitted due to a flag from our content filters
          `),
  ),
});
