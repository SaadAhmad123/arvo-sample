import * as Orchestrators from '@repo/orchestrators';
import * as Services from '@repo/services';
import { resolveSimpleEventBroker } from '@repo/utilities';
import type { ArvoEvent } from 'arvo-core';
import { type IMachineMemory, type MachineMemoryRecord, createSimpleEventBroker } from 'arvo-xstate';
import { settings } from '../commons/index.js';

export const resolveEvent = async (
  memory: IMachineMemory<MachineMemoryRecord>,
  event: ArvoEvent,
  streamer?: (event: ArvoEvent) => Promise<void>,
) => {
  let error: Error | null = null;
  const broker = createSimpleEventBroker(
    [
      ...Object.values(Services).map((item) => item({ settings, streamer })),
      ...Object.values(Orchestrators).map((item) => item(memory)),
    ],
    (e: Error) => {
      error = e;
    },
  );
  const result = await resolveSimpleEventBroker(broker, event);
  if (error) throw error;
  return result;
};
