import { llmOrchestrator } from '@repo/contracts/orchestrators';
import { cleanString } from 'arvo-core';
import type { ReflectorAgentContext } from '../types.js';

export const createGeneratorEvent = (context: ReflectorAgentContext) => {
  const generationContext = context.configuration.context
    ? cleanString(`
    <context>
    ${context.configuration.context}
    </context>
  `)
    : '';

  let systemCommand = cleanString(`
      You are an AI assistant focused on precise task execution. Your role is to:
      ${generationContext ? '- Carefully read and understand the information in <context> tag' : ''}
      - Carefully analyze the provided instructions in the <instructions> tag
      - Generate output that exactly matches the <instructions>, using the information in the 
         <context>, only and exhaustively adhere to the <criteria> tag.
      - Maintain consistency in format and style
      - Verify all output against the original instructions and criteria before responding
      ${context.configuration.json_response ? '- Strictly adhere to the JSON object requirements in the response' : ''}
  `);
  let message = cleanString(`
      ${generationContext}
      <instructions>
      ${context.configuration.instructions}
      </instructions>
      
      Generate the response as per the ${generationContext ? 'context and' : ''} instructions, then validate them against the criteria.
      ${
        context.configuration.json_response
          ? 'Respond in the required JSON format'
          : 'Respond with the output format in the instructions'
      } 
  `);

  /**
   * <criteria>
      ${context.configuration.criteria.map((item, index) => `<item id="${index}">${item}</item>`).join('\n')}
      </criteria>
   */

  if (context.critiques.length) {
    systemCommand = cleanString(`
      You are an AI assistant focused on precise task execution. Your role is to:
        ${generationContext ? '- Carefully read and understand the information in <context> tag' : ''}
        - Carefully analyze the provided instructions in the <instructions> tag
        - Understand the provided existing <content>
        - Understand required <enhancements> to the existing content
        - Modify the content as per the ${generationContext ? 'context,' : ''} instructions and enhancements
        - Generate output that exactly matches the <criteria>
        - Maintain consistency in format and style
        - Verify all output against the original instructions and criteria before responding
        ${context.configuration.json_response ? '- Strictly adhere to the JSON object requirements in the response' : ''}
    `);
    message = cleanString(`
          ${generationContext}
          <instructions>
          ${context.configuration.instructions}
          </instructions>
          <enhancements>
            ${(context.critiques[context.critiques.length - 1] ?? [])
              .filter((item) => item.improvement)
              .map((item, index) => `<item id="${index}">${item.improvement}</item>`)
              .join('\n')}
          <enhancements/>
          <criteria>
            ${context.configuration.criteria.map((item, index) => `<item id="${index}">${item}</item>`).join('\n')}
          </criteria>
          <content>
            ${context.generations.length ? context.generations[context.generations.length - 1] : ''}
          </content>
          Understand the ${generationContext ? 'context, ' : ''} instructions, enhancements and the critieria. Then analyse the content and
          provide a modified response which aligns perfectly with instructions, enhancemnets and the 
          criteria.
          ${
            context.configuration.json_response
              ? 'Respond in the required JSON format'
              : 'Respond with the output format in the instructions'
          } 
      `);
  }

  return {
    type: llmOrchestrator.type,
    data: {
      parentSubject$$: context.initSubject$$,
      model: context.configuration.models.generator,
      system_command: systemCommand,
      messages: [
        {
          role: 'user' as const,
          content: message,
        },
      ],
      json_response: context.configuration.json_response,
    },
  };
};
