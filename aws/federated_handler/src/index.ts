import { arvoToEventBridgeEvent, eventBridgeToArvoEvent, isEventBridgeEvent } from '@aws/utilities';
import type { ArvoEvent } from 'arvo-core';
import type { EventBridgeEvent } from 'aws-lambda';
import { EventResolver } from 'src/EventResolver.js';

type LambdaEvent = EventBridgeEvent<string, unknown>;

export const handler = async (event: LambdaEvent): Promise<EventBridgeEvent<string, ArvoEvent>[] | undefined> => {
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
    const resolvedEvent = await EventResolver.execute(arvoEvent);
    return resolvedEvent.map(arvoToEventBridgeEvent);
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};
