import { generateMock } from '@anatine/zod-mock';
import {
  type ArvoContract,
  type ArvoEvent,
  type ArvoOrchestratorContract,
  type ArvoSemanticVersion,
  EventDataschemaUtil,
  type VersionedArvoContract,
} from 'arvo-core';
import { createArvoEventHandler } from 'arvo-event-handler';
import type { z } from 'zod';

export const expectOrchestratedEvent = <
  // biome-ignore lint/suspicious/noExplicitAny: It should be a generic function
  TOrchestratorContract extends ArvoOrchestratorContract<any, any, any, any>,
  // biome-ignore lint/suspicious/noExplicitAny: It should be a generic function
  TServiceContract extends ArvoContract<any, any, any, any>,
>(
  event: ArvoEvent | undefined,
  contracts: {
    orchestrator: VersionedArvoContract<TOrchestratorContract, ArvoSemanticVersion>;
    service: VersionedArvoContract<TServiceContract, ArvoSemanticVersion>;
  },
) => {
  expect(event?.type).toBe(contracts.service.accepts.type);
  expect(event?.to).toBe(contracts.service.accepts.type);
  expect(event?.source).toBe(contracts.orchestrator.accepts.type);
  expect(event?.redirectto).toBe(contracts.orchestrator.accepts.type);
  expect(event?.dataschema).toBe(EventDataschemaUtil.create(contracts.service));
  expect(contracts.service.accepts.schema.safeParse(event?.data).success).toBe(true);
};

// biome-ignore lint/suspicious/noExplicitAny: It should be a generic function
export const mockArvoEventHandler = <T extends ArvoContract<any, any, any, any>>(contract: T) =>
  createArvoEventHandler({
    contract: contract,
    executionunits: 0,
    // @ts-ignore
    handler: Object.fromEntries(
      Object.entries(contract.versions).map(([version, schemas]) => [
        version,
        async () => {
          return [
            // biome-ignore lint/suspicious/noExplicitAny: It should be a generic function
            ...Object.entries((schemas as any).emits).map(([type, schema]) => ({
              type: type,
              data: generateMock(schema as z.AnyZodObject),
            })),
          ];
        },
      ]),
    ),
  });
