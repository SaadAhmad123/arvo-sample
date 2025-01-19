import type { ServiceSettings } from '@repo/services/commons';
import * as dotenv from 'dotenv';
dotenv.config({
  path: '../../.env',
});

export const settings = async () => {
  const env: NodeJS.ProcessEnv = process.env;
  return {
    OPENAI_API_KEY: env?.OPENAI_API_KEY ?? '',
    OPENAI_ORG_ID: env?.OPENAI_ORG_ID ?? '',
    OPENAI_PROJECT_ID: env?.OPENAI_PROJECT_ID ?? '',
    ANTHROPIC_API_KEY: env?.ANTHROPIC_API_KEY ?? '',
  } satisfies ServiceSettings;
};
