import { DynamoMachineMemory } from '@aws/utilities';
import { SimpleMachineMemory } from 'arvo-xstate';
import { envVars } from 'src/commons/envVars.js';
import { fetchArvoEventHandlerSettings } from './commons/fetchArvoEventHandlerSettings.js';
import { buildEventResolver } from './commons/resolveEvent.js';

/**
* Singleton event resolver instance configured for the application environment.
* 
* Settings are loaded via `fetchArvoEventHandlerSettings` function.
* Memory implementation is determined by `envVars.IS_LAMBDA`:
* - true: Uses DynamoDB tables specified in environment variables
* - false: Uses in-memory storage via SimpleMachineMemory
*/
export const EventResolver = buildEventResolver({
   memory: envVars.IS_LAMBDA
       ? new DynamoMachineMemory(envVars.MACHINE_STATE_DYNAMO_TABLE, envVars.MACHINE_STATE_LOCK_DYNAMO_TABLE)
       : new SimpleMachineMemory(),
   settingsLoader: fetchArvoEventHandlerSettings,
});