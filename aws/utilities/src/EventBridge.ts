import { type CreateArvoEvent, createArvoEvent, type ArvoEvent } from 'arvo-core';
import type { EventBridgeEvent } from 'aws-lambda';

/**
 * Converts an ArvoEvent to an AWS EventBridge event format
 * @param event The ArvoEvent to convert
 * @returns EventBridge formatted event containing the original ArvoEvent
 */
export const arvoToEventBridgeEvent = <T extends ArvoEvent>(event: T): EventBridgeEvent<T['type'], T> => {
  return {
    version: '0',
    id: event.id,
    account: process.env.AWS_ACCOUNT_ID || '',
    time: event.time,
    region: process.env.AWS_REGION || '',
    'detail-type': event.type,
    source: event.source,
    resources: [],
    detail: event,
  };
};

/**
 * Converts an AWS EventBridge event back to an ArvoEvent format
 * @param event The EventBridge event containing an ArvoEvent in its detail field
 * @returns The extracted and validated ArvoEvent
 * @throws Error if conversion fails
 */
export const eventBridgeToArvoEvent = (event: EventBridgeEvent<string, unknown>): ArvoEvent => {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: Need to be general
    return createArvoEvent(event.detail as CreateArvoEvent<Record<string, any>, string>);
  } catch (e) {
    throw new Error(
      `Failed to convert EventBridge event to ArvoEvent. This likely indicates an event routing or event structure mismatch.\nOriginal error: ${(e as Error).message}\nEventBridge event: ${JSON.stringify(event)}`,
    );
  }
};

export const isEventBridgeEvent = (event: EventBridgeEvent<string, unknown>) => 'detail' in event;
