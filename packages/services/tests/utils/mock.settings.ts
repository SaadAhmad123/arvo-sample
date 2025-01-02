import * as dotenv from 'dotenv';
import type { ServiceSettings } from '../../src/types.js';
dotenv.config({
  path: '../../.env',
});

export const getMockSettingsFactory: (mock?: boolean) => () => Promise<ServiceSettings> =
  (mock = false) =>
  async () => {
    const env: NodeJS.ProcessEnv | null = !mock ? (process.env ?? null) : null;
    return {
      OPENAI_API_KEY: env?.OPENAI_API_KEY ?? 'MOCK',
      OPENAI_ORG_ID: env?.OPENAI_ORG_ID ?? 'MOCK',
      OPENAI_PROJECT_ID: env?.OPENAI_PROJECT_ID ?? 'MOCK',
      ANTHROPIC_API_KEY: env?.ANTHROPIC_API_KEY ?? 'MOCK',
    };
  };
