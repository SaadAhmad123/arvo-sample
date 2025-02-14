import {
  ArvoOrchestrationSubject,
  type VersionedArvoContract,
  createArvoEventFactory,
  currentOpenTelemetryHeaders,
} from 'arvo-core';
import { v4 as uuid4 } from 'uuid';

export const createEventFromHono = (
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  data: Record<string, any>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  contract: VersionedArvoContract<any, any>,
) => {
  const source = 'service.oriented.router';
  const eventType: string = contract.accepts.type;

  const subject = ArvoOrchestrationSubject.new({
    initiator: source,
    orchestator: eventType,
    version: contract.version,
    meta: {
      sessionId: uuid4(),
    },
  });

  const otelHeaders = currentOpenTelemetryHeaders();

  return createArvoEventFactory(contract).accepts({
    source: source,
    subject: subject,
    data: {
      ...data,
      parentSubject$$: null,
    },
    traceparent: otelHeaders.traceparent ?? undefined,
    tracestate: otelHeaders.tracestate ?? undefined,
  });
};
