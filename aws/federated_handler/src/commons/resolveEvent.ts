import type { AbstractArvoEventHandler } from 'arvo-event-handler';
import type { ServiceSettings } from '@repo/services/commons';
import * as Orchestrators from '@repo/orchestrators';
import * as Services from '@repo/services';
import type { ArvoEvent } from 'arvo-core';
import type { IMachineMemory, MachineMemoryRecord } from 'arvo-xstate';

type ResolveEventParam = {
  event: ArvoEvent;
  memory: IMachineMemory<MachineMemoryRecord>;
  settingsLoader: () => Promise<ServiceSettings>;
  streamer?: (event: ArvoEvent) => Promise<void>;
};

export const resolveEvent = async ({
  event,
  memory,
  settingsLoader,
  streamer,
}: ResolveEventParam): Promise<ArvoEvent[]> => {
  const handlers = [
    ...Object.values(Services).map((item) => item({ settings: settingsLoader, streamer })),
    ...Object.values(Orchestrators).map((item) => item(memory)),
  ];
  const handlerRegistry = new Map<string, AbstractArvoEventHandler>();
  for (const handler of handlers) {
    handlerRegistry.set(handler.source, handler);
  }
  const resolvedHandler = handlerRegistry.get(event.to ?? event.source);
  return (await resolvedHandler?.execute(event, { inheritFrom: 'EVENT' })) ?? [];
};
