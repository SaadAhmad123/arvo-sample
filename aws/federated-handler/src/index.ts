import { arvoToEventBridgeEvent, eventBridgeToArvoEvent, isEventBridgeEvent, sendToEventBus } from '@aws/utilities';
import type { ArvoEvent } from 'arvo-core';
import type { EventBridgeEvent } from 'aws-lambda';
import { EventResolver } from 'src/EventResolver.js';
import { envVars } from 'src/commons/envVars.js';

export const handler = async (
  event: EventBridgeEvent<string, unknown>,
): Promise<EventBridgeEvent<string, ArvoEvent>[] | undefined> => {
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
    const resolvedEvents = await EventResolver.execute(arvoEvent);
    const eventbridgeEvents = resolvedEvents.map(arvoToEventBridgeEvent);

    if (envVars.IS_LAMBDA) {
      await sendToEventBus(resolvedEvents, envVars.EVENT_BRIDGE_NAME);
    }

    return eventbridgeEvents;
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};
