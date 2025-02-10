import { DynamoMachineMemory, getRuntimeEnvironment } from '@aws/utilities';
import { SimpleMachineMemory } from 'arvo-xstate';
import { buildEventResolver } from './commons/resolveEvent.js';
import { settingsLoader } from './commons/settings.js';

export const EventResolver = buildEventResolver({
  memory: getRuntimeEnvironment().isLambda
    ? new DynamoMachineMemory(
        process.env.MACHINE_DATA_TABLE ?? 'machine-state-table',
        process.env.MACHINE_LOCK_TABLE ?? 'machine-lock-table',
      )
    : new SimpleMachineMemory(),
  settingsLoader: settingsLoader,
});
