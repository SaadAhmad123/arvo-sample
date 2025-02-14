import type { ServiceSettings } from '@repo/services/commons';
import { envVars } from './envVars.js';

export const fetchArvoEventHandlerSettings = async () => {
  return {
    OPENAI_API_KEY: envVars.OPENAI_API_KEY,
    OPENAI_ORG_ID: envVars.OPENAI_ORG_ID,
    OPENAI_PROJECT_ID: envVars.OPENAI_PROJECT_ID,
    ANTHROPIC_API_KEY: envVars.ANTHROPIC_API_KEY,
  } satisfies ServiceSettings;
};
