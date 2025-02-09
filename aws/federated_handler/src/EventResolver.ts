import { buildEventResolver } from './commons/resolveEvent.js';
import { settings } from './commons/settings.js';
import { SimpleMachineMemory } from 'arvo-xstate';

export const EventResolver = buildEventResolver({
  memory: new SimpleMachineMemory(),
  settingsLoader: settings,
});
