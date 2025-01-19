import type { Context } from 'hono';
import {
  type ArvoEvent,
  ArvoOrchestrationSubject,
  createArvoEvent,
  currentOpenTelemetryHeaders,
  EventDataschemaUtil,
  type VersionedArvoContract,
  WildCardArvoSemanticVersion,
} from 'arvo-core';
import { v4 as uuid4 } from 'uuid';

/** Initial event source identifier for webapp service execution */
export const initEventSource = 'federated.api.execute';

/**
 * Creates an ArvoEvent from a Hono Context object
 *
 * @param c - Hono Context object containing the request data
 * @returns {ArvoEvent} A new ArvoEvent instance with data from the context
 *
 * @example
 * ```typescript
 * const event = createEventFromHonoContext(context);
 * ```
 *
 * @throws {Error} If the request body is not valid JSON
 */
export const createEventFromHonoContext = (
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  c: Context<any, any, any>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  dataschemaToContractMap: Record<string, VersionedArvoContract<any, any>>,
): ArvoEvent => {
  // biome-ignore lint/suspicious/noExplicitAny: A hono limitation
  const data: any = c.req.valid('json');
  const source = initEventSource;
  const eventType: string | null = dataschemaToContractMap[data.dataschema]?.accepts.type ?? null;

  if (!eventType) {
    throw new Error('The provided dataschema is not registered to be serviced');
  }

  const subject = ArvoOrchestrationSubject.new({
    initiator: source,
    orchestator: eventType,
    version: EventDataschemaUtil.parse(data.dataschema)?.version ?? WildCardArvoSemanticVersion,
    meta: {
      sessionId: uuid4(),
    },
  });

  const otelHeaders = currentOpenTelemetryHeaders();

  return createArvoEvent({
    source: source,
    subject: subject,
    dataschema: data.dataschema ?? WildCardArvoSemanticVersion,
    type: eventType,
    data: {
      ...data.data,
      parentSubject$$: null,
    },
    traceparent: otelHeaders.traceparent ?? undefined,
    tracestate: otelHeaders.tracestate ?? undefined,
  });
};
