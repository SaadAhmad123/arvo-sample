'use client';

import {
  type ArvoContract,
  type ArvoSemanticVersion,
  EventDataschemaUtil,
  type VersionedArvoContract,
} from 'arvo-core';
import { type AbstractArvoEventHandler, ArvoEventHandler } from 'arvo-event-handler';
import { ArvoOrchestrator } from 'arvo-xstate';
import type { EventFlow, EventFlowItem } from './types';

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
    contract: {
      uri: contract.uri,
      version: contract.version,
      dataschema: EventDataschemaUtil.create(contract),
    },
  });

  for (const type of Object.keys(contract.emits)) {
    events.push({
      flow: emitFlowType,
      type: type,
      contract: {
        uri: contract.uri,
        version: contract.version,
        dataschema: EventDataschemaUtil.create(contract),
      },
    });
  }

  events.push({
    flow: emitFlowType,
    type: contract.systemError.type,
    contract: {
      uri: contract.uri,
      version: contract.version,
      dataschema: EventDataschemaUtil.create(contract),
    },
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
export const inferEventFlow = (handlers: { name: string; handler: AbstractArvoEventHandler }[]): EventFlow[] => {
  const flows: EventFlow[] = [];

  for (const handler of handlers) {
    if (handler.handler instanceof ArvoEventHandler) {
      const contract: ArvoContract = handler.handler.contract;
      for (const version of Object.keys(contract.versions)) {
        const versionedContract = contract.version(version as ArvoSemanticVersion);
        flows.push({
          group: handler.handler.source,
          name: EventDataschemaUtil.create(versionedContract),
          type: 'service',
          events: extractEventFlow(versionedContract, 'producer'),
        });
      }
    }
    if (handler.handler instanceof ArvoOrchestrator) {
      for (const machine of handler.handler.registry.machines) {
        let events = extractEventFlow(machine.contracts.self, 'producer');
        for (const serviceContract of Object.values(machine.contracts.services)) {
          // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
          events = [...events, ...extractEventFlow(serviceContract as VersionedArvoContract<any, any>, 'consumer')];
        }
        flows.push({
          group: handler.handler.source,
          name: EventDataschemaUtil.create(machine.contracts.self),
          type: 'orchestrator',
          events: events,
        });
      }
    }
  }

  return flows;
};
