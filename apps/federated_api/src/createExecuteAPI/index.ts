import { OpenAPIHono } from '@hono/zod-openapi';
import { EventDataschemaUtil, type ArvoEvent, type VersionedArvoContract } from 'arvo-core';
import { createSimpleEventBroker, SimpleMachineMemory } from 'arvo-xstate';
import { createRouteSpec } from 'src/createExecuteAPI/createRouteSpec.js';
import * as Services from '@repo/services';
import * as Orchestrators from '@repo/orchestrators';
import { settings } from '../commons/index.js';
import { createEventFromHonoContext } from './createEventFromHonoContext.js';
import { resolveSimpleEventBroker } from '@repo/utilities';

// biome-ignore lint/suspicious/noExplicitAny: Need to be general
export const createExecuteAPI = (contracts: VersionedArvoContract<any, any>[]) => {
  const routeSpec = createRouteSpec(contracts);
  const dataschemaToContractMap = Object.fromEntries(contracts.map((item) => [EventDataschemaUtil.create(item), item]));
  const api = new OpenAPIHono();

  api.openapi(routeSpec, async (c) => {
    try {
      const memory = new SimpleMachineMemory();
      const streamer = async (data: ArvoEvent) => console.log({ data });
      let error: Error | null = null;
      const broker = createSimpleEventBroker(
        [
          ...Object.values(Services).map((item) => item({ settings, streamer })),
          ...Object.values(Orchestrators).map((item) => item(memory)),
        ],
        (e: Error) => {
          error = e;
        },
      );

      const event = createEventFromHonoContext(c, dataschemaToContractMap);
      const result = await resolveSimpleEventBroker(broker, event);
      if (error) throw error;

      return c.json(
        {
          event: {
            type: result.event.type,
            dataschema: result.event.dataschema,
            data: result.event.data,
          },
          history: result.history.map((item) => ({
            type: item.type,
            dataschmea: item.dataschema,
            data: item.data,
          })),
        },
        200,
      );
    } catch (e) {
      return c.json(
        {
          cause: (e as Error)?.cause,
          name: (e as Error)?.name ?? 'Error',
          message: (e as Error)?.message ?? 'Internal server process',
        },
        500,
      );
    }
  });

  return api;
};
