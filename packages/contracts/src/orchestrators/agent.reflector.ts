import { cleanString, createArvoOrchestratorContract } from 'arvo-core';
import { z } from 'zod';
import { createOrchestratorCompletionSchema } from '../commons/schema.orchestrator.complete.js';
import { llmModelSchema } from './commons/llmModelSchema.js';

const critiqueSchema = z.object({
  criterion: z.string(),
  satisfied: z.boolean(),
  improvement: z.string().nullable(),
});

const generationSchema = z.object({
  valid_json: z.boolean().nullable(),
  content: z.string(),
  evaluation_score: z.number().min(0).max(1),
  critique: critiqueSchema.array(),
  total_token_usage: z.object({
    critique: z.number(),
    generation: z.number(),
  }),
});

/**
 * This agent creates a response, reflects on it, and improves
 * it in case and improvement is required. The agent is inspired
 * from:
 * https://medium.com/google-cloud/designing-cognitive-architectures-agentic-workflow-patterns-from-scratch-63baa74c54bc
 */
export const reflectorAgentOrchestrator = createArvoOrchestratorContract({
  uri: '#/orchestrators/agents/reflector',
  name: 'agent.reflector',
  versions: {
    '1.0.0': {
      init: z.object({
        models: z
          .object({
            generator: llmModelSchema,
            critic: llmModelSchema,
          })
          .default({
            generator: {
              provider: 'openai',
              model: 'gpt-4o-mini',
            },
            critic: {
              provider: 'openai',
              model: 'gpt-4o-mini',
            },
          }),
        context: z
          .string()
          .array()
          .optional()
          .describe('The optional context for generations. These are the context chunks.'),
        instructions: z.string().describe('The instrcutions or input to the Agent on what to generate'),
        json_response: z.boolean().default(false).describe('Should the generated output be a json object'),
        criteria: z
          .string()
          .array()
          .describe('A list of criteria (e.g. yes/no question) which the genration must satisfy'),
        criteria_satisfaction_threshold: z
          .number()
          .min(0)
          .max(1)
          .default(0.9)
          .describe(
            'The minimum percentage of all the criteria to be met before consider a generation to be satisfactory.',
          ),
        max_iterations: z
          .number()
          .default(1)
          .describe('Max number of iterations the agent can do before returning the response'),
      }),
      complete: createOrchestratorCompletionSchema(
        z.object({
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
          generations: generationSchema
            .array()
            .describe('A list of all the generations. The last one is the final generation'),
          best_generation: generationSchema,
          total_token_usage: z.number().describe('The total token usage of the entire process'),
        }),
      ),
    },
  },
});
