import { EventBridgeClient, PutEventsCommand, type PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import { type ArvoEvent, type CreateArvoEvent, ViolationError, createArvoEvent } from 'arvo-core';
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

/**
 * Custom error class for AWS EventBridge publish failures
 * Provides detailed error information including the failed events and AWS response
 */
export class AWSEventBridgePublishViolation extends ViolationError<'AWSEventBridgePublish'> {
  constructor(params: {
    message: string;
    // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
    metadata?: Record<string, any>;
  }) {
    super({
      ...params,
      type: 'AWSEventBridgePublish',
    });
  }
}

/**
 * AWS configuration options for EventBridge client
 */
export type AWSEventBusConfig = {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

/**
 * Sends ArvoEvents to an AWS EventBridge event bus. Can handle single or multiple events.
 * Uses AWS credentials from environment variables if not provided in config.
 *
 * @param events - Single ArvoEvent or array of ArvoEvents to publish
 * @param eventBusName - Target EventBridge event bus name
 * @param config - Optional AWS configuration (region and credentials)
 * @throws AWSEventBridgePublishViolation if publishing fails
 * @example
 * await sendToEventBus(arvoEvent, 'my-event-bus');
 * await sendToEventBus([event1, event2], 'my-event-bus', { region: 'us-east-1' });
 */
export const sendToEventBus = async (
  events: ArvoEvent | ArvoEvent[],
  eventBusName: string,
  config: AWSEventBusConfig = {},
): Promise<void> => {
  const client = new EventBridgeClient({
    region: config.region ?? process.env.AWS_REGION ?? 'ap-southeast-2',
    credentials:
      config.accessKeyId && config.secretAccessKey
        ? {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        : undefined,
  });

  const entries: PutEventsRequestEntry[] = (Array.isArray(events) ? events : [events]).map((event) => ({
    EventBusName: eventBusName,
    Detail: JSON.stringify(event),
    DetailType: event.type,
    Source: event.source,
    Time: new Date(event.time),
  }));

  try {
    await client.send(new PutEventsCommand({ Entries: entries }));
  } catch (error) {
    throw new AWSEventBridgePublishViolation({
      message: `Failed to send events to EventBridge bus ${eventBusName}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        eventBusName,
        events,
        error,
        entries,
      },
    });
  }
};
