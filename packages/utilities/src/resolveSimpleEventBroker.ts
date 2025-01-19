import { type ArvoEvent, cleanString } from 'arvo-core';
import type { SimpleEventBroker } from 'arvo-xstate';

type ResolutionResult = {
  event: ArvoEvent;
  history: ArvoEvent[];
};

/**
 * Resolves an event through a SimpleEventBroker by publishing it and waiting for the final processed event.
 * This function is useful for synchronously waiting for the completion of an event-driven workflow.
 *
 * @description
 * The function performs the following steps:
 * 1. Validates that the event source doesn't conflict with existing broker topics
 * 2. Subscribes to the event source to capture the final processed event
 * 3. Publishes the initial event to the broker
 * 4. Waits for and returns the final event along with processing history
 *
 * @param broker - The SimpleEventBroker instance to use for event processing
 * @param event - The initial event to publish and resolve
 *
 * @returns Promise<ResolutionResult> containing:
 *   - event: The final processed event
 *   - history: Array of all events processed during resolution
 *
 * @throws Error if:
 *   - The event source conflicts with existing broker topics
 *   - No final event is produced (indicating no handlers or processing errors)
 *
 * @example
 * ```typescript
 * const broker = new SimpleEventBroker({ ... });
 * const initialEvent = createArvoEvent({source: 'internal.event.handler', ...});
 *
 * try {
 *   const { event, history } = await resolveSimpleEventBroker(broker, initialEvent);
 *   // Handle final resolved event
 * } catch (error) {
 *   // Handle resolution errors
 * }
 * ```
 *
 * @remarks
 * - The function automatically cleans up subscriptions using the returned unsubscriber
 * - If no final event is produced, it attempts to use the last event in broker history
 * - The function is intended for synchronous workflow resolution, not long-running processes
 */
export const resolveSimpleEventBroker = async (
  broker: SimpleEventBroker,
  event: ArvoEvent,
): Promise<ResolutionResult> => {
  const initEventSource: string = event.source;

  if (broker.topics.includes(initEventSource)) {
    throw new Error(
      cleanString(
        `
          The event source must be topic which does not correspond to any existing topic in the broker.
          The provided event.source(=${initEventSource}) however does not satisfy this requirement.
        `,
      ),
    );
  }
  let finalEvent: ArvoEvent | null = null;
  const unsubscriber = broker.subscribe(initEventSource, async (event) => {
    finalEvent = event;
  });

  try {
    await broker.publish(event);
    finalEvent = finalEvent ?? broker.events[broker.events.length - 1] ?? null;
    if (!finalEvent) {
      throw new Error('Unable to resolve the event. Either no handler emitted any event or some error occured');
    }
    return {
      event: finalEvent,
      history: broker.events,
    };
  } finally {
    unsubscriber();
  }
};
