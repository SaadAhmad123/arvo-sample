import * as Orchestrators from '@repo/orchestrators';
import * as Services from '@repo/services';
import type { ServiceSettings } from '@repo/services/commons';
import type { ArvoEvent } from 'arvo-core';
import type { AbstractArvoEventHandler } from 'arvo-event-handler';
import type { IMachineMemory, MachineMemoryRecord } from 'arvo-xstate';

/**
* Configuration options for building the event resolver
* @property memory - Machine memory implementation for state management
* @property settingsLoader - Function to load service settings
* @property streamer - Optional function to stream events as they are processed
*/
type BuildEventResolver = {
   memory: IMachineMemory<MachineMemoryRecord>;
   settingsLoader: () => Promise<ServiceSettings>;
   streamer?: (event: ArvoEvent) => Promise<void>;
};

/**
* Builds an event resolver that maps events to their appropriate handlers. 
* Uses handlers directly from Services and Orchestrators packages.
* To modify available handlers, update the imports from these packages.
* 
* @param memory - Machine memory for state persistence
* @param settingsLoader - Function to load service configuration
* @param streamer - Optional event streaming callback
* @returns Object containing:
*   - listensTo: Array of handler sources this resolver can process
*   - execute: Function to process an event with the appropriate handler
* 
* @example
* const resolver = buildEventResolver({
*   memory: new InMemoryMachineMemory(),
*   settingsLoader: async () => ({ ... }),
*   streamer: async (event) => console.log(event)
* });
* 
* // Get list of supported handlers
* console.log(resolver.listensTo);
* 
* // Process an event
* const results = await resolver.execute(arvoEvent);
*/
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