import type { ArvoEvent } from 'arvo-core';
import { createSimpleEventBroker, type IMachineMemory, type MachineMemoryRecord } from 'arvo-xstate';
import * as Services from '@repo/services';
import * as Orchestrators from '@repo/orchestrators';
import { settings } from '../commons/index.js';
import { resolveSimpleEventBroker } from '@repo/utilities';

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
