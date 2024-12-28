import type { ServiceSettings } from '../src/types.js';

export const getMockSettings: () => Promise<ServiceSettings> = async () => ({
  OPENAI_API_KEY: 'MOCK',
  OPENAI_ORG_ID: 'MOCK',
  OPENAI_PROJECT_ID: 'MOCK',
});
