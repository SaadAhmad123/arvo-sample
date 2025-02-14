import { getRuntimeEnvironment } from '@aws/utilities';

export const envVars = {
  IS_LAMBDA: getRuntimeEnvironment().isLambda,
  MACHINE_STATE_DYNAMO_TABLE: process.env.MACHINE_STATE_DYNAMO_TABLE ?? '',
  MACHINE_STATE_LOCK_DYNAMO_TABLE: process.env.MACHINE_STATE_LOCK_DYNAMO_TABLE ?? '',
  EVENT_BRIDGE_NAME: process.env.EVENT_BRIDGE_NAME ?? '',
} as const;
