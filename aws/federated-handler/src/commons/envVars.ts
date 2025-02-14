import { getRuntimeEnvironment } from '@aws/utilities';
import * as dotenv from 'dotenv';

if (getRuntimeEnvironment().isLambda) {
  dotenv.config({
    path: '../../.env',
  });
}

export const envVars = {
  IS_LAMBDA: getRuntimeEnvironment().isLambda,
  MACHINE_STATE_DYNAMO_TABLE: process.env.MACHINE_STATE_DYNAMO_TABLE ?? '',
  MACHINE_STATE_LOCK_DYNAMO_TABLE: process.env.MACHINE_STATE_LOCK_DYNAMO_TABLE ?? '',
  EVENT_BRIDGE_NAME: process.env.EVENT_BRIDGE_NAME ?? '',

  // Service environment variables
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  OPENAI_ORG_ID: process.env.OPENAI_ORG_ID ?? '',
  OPENAI_PROJECT_ID: process.env.OPENAI_PROJECT_ID ?? '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
} as const;
