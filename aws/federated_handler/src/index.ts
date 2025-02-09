import type { EventBridgeEvent } from 'aws-lambda';
import type { ArvoEvent } from 'arvo-core';
import { eventBridgeToArvoEvent, isEventBridgeEvent } from '@aws/utilities';
import { resolveEvent } from './commons/resolveEvent.js';
import { settings } from './commons/settings.js';
import { SimpleMachineMemory } from 'arvo-xstate';

type LambdaEvent = EventBridgeEvent<string, unknown>;

export const handler = async (event: LambdaEvent): Promise<ArvoEvent[] | undefined> => {
  try {
    let arvoEvent: ArvoEvent | null = null;
    if (isEventBridgeEvent(event)) {
      arvoEvent = eventBridgeToArvoEvent(event);
    }

    if (!arvoEvent) {
      console.log(
        `Invalid event recieved. The event must contain an inferable ArvoEvent. The received event is ${JSON.stringify(event)}`,
      );
      return;
    }

    const resolvedEvent = await resolveEvent({
      event: arvoEvent,
      memory: new SimpleMachineMemory(),
      settingsLoader: settings,
    });

    return resolvedEvent;
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};
