import type { ArvoEvent } from 'arvo-core';
import type { SimpleMachineMemory } from 'arvo-xstate';

export const transformArvoEvent = (event: ArvoEvent) => ({
  data: event.data,
  type: event.type,
  dataschema: event.dataschema,
});

export const clearMemory = (memory: SimpleMachineMemory, key: string | null) => {
  try {
    if (!key) return;
    memory.clear(key);
  } catch (e) {}
};
