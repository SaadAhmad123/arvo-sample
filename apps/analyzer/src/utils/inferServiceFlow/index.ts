'use client';

import {
  type ArvoContract,
  type ArvoSemanticVersion,
  EventDataschemaUtil,
  type VersionedArvoContract,
} from 'arvo-core';
import { type AbstractArvoEventHandler, ArvoEventHandler } from 'arvo-event-handler';
import { ArvoOrchestrator } from 'arvo-xstate';
import type { EventFlowItem, ServiceFlow } from './types';

/**
 * Extracts event flows from a versioned contract based on its producer/consumer role
 *
 * @param contract - Versioned contract to analyze
 * @param serviceType - Role of the service ('producer' or 'consumer')
 * @returns Array of event flow items
 *
 * @example
 * ```ts
 * const flows = extractEventFlow(myContract, 'producer');
 * ```
 */
const extractEventFlow = (
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  contract: VersionedArvoContract<any, any>,
  serviceType: 'producer' | 'consumer',
): EventFlowItem[] => {
  const events: EventFlowItem[] = [];
  const acceptFlowType: EventFlowItem['flow'] = serviceType === 'producer' ? 'ingress' : 'egress';
  const emitFlowType: EventFlowItem['flow'] = serviceType === 'producer' ? 'egress' : 'ingress';
  events.push({
    flow: acceptFlowType,
    type: contract.accepts.type,
  });
  for (const type of Object.keys(contract.emits)) {
    events.push({
      flow: emitFlowType,
      type: type,
    });
  }
  events.push({
    flow: emitFlowType,
    type: contract.systemError.type,
  });
  return events;
};

/**
 * Infers the event flow structure from a collection of handlers
 *
 * @param handlers - Array of named handlers to analyze
 * @returns Array of event flows with their complete structure
 *
 * @remarks
 * - Processes service handlers for each contract version
 * - Processes orchestrator handlers with their service contracts
 * - Combines both ingress and egress flows
 */
export const inferServiceFlow = (handlers: { name: string; handler: AbstractArvoEventHandler }[]): ServiceFlow[] => {
  const flows: ServiceFlow[] = [];

  for (const handler of handlers) {
    if (handler.handler instanceof ArvoEventHandler) {
      const service: ServiceFlow = {
        name: handler.name,
        handledEventType: handler.handler.source,
        type: 'service',
        handlers: [],
      };
      const contract: ArvoContract = handler.handler.contract;
      for (const version of Object.keys(contract.versions)) {
        const versionedContract = contract.version(version as ArvoSemanticVersion);
        service.handlers.push({
          version: version,
          contracts: {
            self: {
              uri: versionedContract.uri,
              version: versionedContract.version,
              dataschema: EventDataschemaUtil.create(versionedContract),
              events: extractEventFlow(versionedContract, 'producer'),
            },
            services: [],
          },
        });
      }
      flows.push(service);
    }
    if (handler.handler instanceof ArvoOrchestrator) {
      const service: ServiceFlow = {
        handledEventType: handler.handler.source,
        name: handler.name,
        type: 'orchestrator',
        handlers: [],
      };
      for (const machine of handler.handler.registry.machines) {
        // biome-ignore lint/suspicious/noExplicitAny: Needs generalisation
        const selfContract: VersionedArvoContract<any, any> = machine.contracts.self;
        // biome-ignore lint/suspicious/noExplicitAny: Needs generalisation
        const serviceContract: Record<string, VersionedArvoContract<any, any>> = machine.contracts.services;
        service.handlers.push({
          version: selfContract.version,
          contracts: {
            self: {
              uri: selfContract.uri,
              version: selfContract.version,
              dataschema: EventDataschemaUtil.create(selfContract),
              events: extractEventFlow(selfContract, 'producer'),
            },
            services: Object.values(serviceContract).map((item) => ({
              uri: item.uri,
              version: item.version,
              dataschema: EventDataschemaUtil.create(item),
              events: extractEventFlow(item, 'consumer'),
            })),
          },
        });
      }
      flows.push(service);
    }
  }
  return flows;
};
