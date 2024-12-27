import { z } from 'zod';

export const openai = z.enum(['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']);
export const anthropic = z.enum([
  'claude-3-5-sonnet-20240620',
  'claude-3-sonnet-20240229',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
]);
