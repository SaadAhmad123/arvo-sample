import { OpenAPIHono } from '@hono/zod-openapi';
import { type ArvoEvent, EventDataschemaUtil, type VersionedArvoContract } from 'arvo-core';
import { SimpleMachineMemory } from 'arvo-xstate';
import { streamSSE } from 'hono/streaming';
import { createEventFromHono } from '../commons/index.js';
import { createRouteSpec } from './createRouteSpec.js';
import { resolveEvent } from './resolveEvent.js';
import { clearMemory, transformArvoEvent } from './utils.js';

// biome-ignore lint/suspicious/noExplicitAny: Need to be general
export const createFederatedAPI = (contracts: VersionedArvoContract<any, any>[]) => {
  const dataschemaToContractMap = Object.fromEntries(contracts.map((item) => [EventDataschemaUtil.create(item), item]));
  const api = new OpenAPIHono();
  const memory = new SimpleMachineMemory();

  api.openapi(createRouteSpec(contracts), async (c) => {
    let eventSubject: string | null = null;
    try {
      // biome-ignore lint/suspicious/noExplicitAny: A hono limitation
      const data: any = c.req.valid('json');
      const contract = dataschemaToContractMap[data.dataschema];
      if (!contract) {
        throw new Error('The provided dataschema is not registered to be serviced');
      }

      const event = createEventFromHono(data.data, contract);
      eventSubject = event.subject;
      const result = await resolveEvent(memory, event);

      return c.json(
        {
          total_execution_units: result.totalExecutionUnits,
          event: transformArvoEvent(result.event),
          history: result.history.map(transformArvoEvent),
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
    } finally {
      clearMemory(memory, eventSubject);
    }
  });

  api.openapi(createRouteSpec(contracts, '/sse', false), async (c) => {
    return streamSSE(c, async (stream) => {
      let eventSubject: string | null = null;
      try {
        // biome-ignore lint/suspicious/noExplicitAny: A hono limitation
        const data: any = c.req.valid('json');
        const contract = dataschemaToContractMap[data.dataschema];
        if (!contract) {
          throw new Error('The provided dataschema is not registered to be serviced');
        }

        const streamer = async (event: ArvoEvent) => {
          await stream.writeSSE({
            event: 'stream',
            data: JSON.stringify(event.toJSON()),
            id: event.id,
          });
        };

        const event = createEventFromHono(data.data, contract);
        eventSubject = event.subject;
        const result = await resolveEvent(memory, event, streamer);

        await stream.writeSSE({
          event: 'success',
          data: JSON.stringify({
            ...result.event.toJSON(),
            total_execution_units: result.totalExecutionUnits,
          }),
          id: result.event.id,
        });
      } catch (e) {
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({
            cause: (e as Error)?.cause,
            name: (e as Error)?.name ?? 'Error',
            message: (e as Error)?.message ?? 'Internal server process',
          }),
        });
      } finally {
        clearMemory(memory, eventSubject);
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    }) as any;
  });

  return api;
};
