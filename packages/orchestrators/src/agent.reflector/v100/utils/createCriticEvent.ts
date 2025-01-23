import { llmOrchestrator } from '@repo/contracts/orchestrators';
import { cleanString } from 'arvo-core';
import * as z from 'zod';
import type { ReflectorAgentContext } from '../types.js';

export const CriticResponseSchema = z.object({
  analysis: z
    .object({
      id: z.number(),
      satisfied: z.boolean(),
      improvement: z.string().nullable(),
    })
    .array(),
});

export const createCriticEvent = (context: ReflectorAgentContext) => {
  const generationContext = context.configuration.context
    ? cleanString(`
    <context>
    ${context.configuration.context}
    </context>
  `)
    : '';
  return {
    type: llmOrchestrator.type,
    data: {
      parentSubject$$: context.initSubject$$,
      system_command: cleanString(`
              You are a precise critic evaluating LLM output in <output> against criteria in <criteria>. Your role:
              - Evaluate if each criterion is satisfied (true/false)
              - For unsatisfied criteria, provide a concise, specific improvement
              - Return evaluation in exact JSON format
              - Keep improvements actionable and concise
          `),
      model: context.configuration.models.critic,
      json_response: true,
      messages: [
        {
          role: 'user' as const,
          content: cleanString(`
                  ${generationContext}
                  <criteria>
                  ${context.configuration.criteria.map((item, index) => `<item id="${index}">${item}</item>`).join('\n')}
                  </criteria>
                  <output>
                  ${context.rawGenerations[context.rawGenerations.length - 1]?.content ?? ''}
                  </output>
                  Evaluate using these steps:
                  1. Understand each criterion
                  2. Thoroughly analyze output against each criterion
                  3. Note specific improvements for each unmet criterion
                  4. Return JSON object tabulating the entire analysis
                  {
                    analysis: [
                        {
                            "id": number, // Criterion ID
                            "satisfied": boolean // true if met
                            "improvement": string | null // null if satisfied, else brief fix
                        }
                    ] // A list for all the criteria.
                  }
              `),
        },
      ],
    },
  };
};
