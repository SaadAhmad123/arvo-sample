import type { AbstractArvoEventHandler } from 'arvo-event-handler';
import type { ServiceSettings } from '@repo/services/commons';
import * as Orchestrators from '@repo/orchestrators';
import * as Services from '@repo/services';
import type { ArvoEvent } from 'arvo-core';
import type { IMachineMemory, MachineMemoryRecord } from 'arvo-xstate';

type BuildEventResolver = {
  memory: IMachineMemory<MachineMemoryRecord>;
  settingsLoader: () => Promise<ServiceSettings>;
  streamer?: (event: ArvoEvent) => Promise<void>;
};

export const buildEventResolver = ({ memory, settingsLoader, streamer }: BuildEventResolver) => {
  const handlers = [
    ...Object.values(Services).map((item) => item({ settings: settingsLoader, streamer })),
    ...Object.values(Orchestrators).map((item) => item(memory)),
  ];
  const handlerRegistry = new Map<string, AbstractArvoEventHandler>();
  for (const handler of handlers) {
    handlerRegistry.set(handler.source, handler);
  }

  return {
    listensTo: Array.from(handlerRegistry.keys()),
    execute: async (event: ArvoEvent): Promise<ArvoEvent[]> => {
      const resolvedHandler = handlerRegistry.get(event.to ?? event.source);
      return (await resolvedHandler?.execute(event, { inheritFrom: 'EVENT' })) ?? [];
    },
  };
};
