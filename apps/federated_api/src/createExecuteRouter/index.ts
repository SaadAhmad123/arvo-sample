import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import type { ArvoEvent, VersionedArvoContract } from 'arvo-core';
import { settings, createEventFromHono } from '../commons/index.js';
import z from 'zod';
import { createSimpleEventBroker, SimpleMachineMemory } from 'arvo-xstate';
import * as Services from '@repo/services';
import * as Orchestrators from '@repo/orchestrators';
import { resolveSimpleEventBroker } from '@repo/utilities';

// biome-ignore lint/suspicious/noExplicitAny: Needs to be general
const createContractRouteSpec = (contract: VersionedArvoContract<any, any>) => {
  const inputSchema: unknown = z.object({
    data: contract.accepts.schema,
  });
  const dataschema: string = contract.dataschema;
  const outputSchema: unknown[] = [];
  for (const [type, schema] of Object.entries(contract.emits)) {
    outputSchema.push(
      z.object({
        type: z.literal(type),
        dataschema: z.literal(dataschema),
        data: schema as z.AnyZodObject,
      }),
    );
  }
  outputSchema.push(
    z.object({
      type: z.literal(contract.systemError.type),
      dataschema: z.literal(contract.systemError.dataschema),
      data: contract.systemError.schema,
    }),
  );

  return createRoute({
    method: 'post',
    tags: ['Service Oriented API'],
    path: dataschema.replace('#', ''),
    request: {
      body: {
        content: {
          'application/json': {
            // biome-ignore lint/suspicious/noExplicitAny: Zod limitation
            schema: inputSchema as any,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: z.object({
              // biome-ignore lint/suspicious/noExplicitAny: Zod limitation
              event: z.union(outputSchema as any),
              // biome-ignore lint/suspicious/noExplicitAny: Zod limitation
              history: z.union(outputSchema as any).array(),
            }),
          },
        },
      },
      500: {
        description: 'Success',
        content: {
          'application/json': {
            schema: z.object({
              cause: z.string().optional(),
              name: z.string(),
              message: z.string(),
            }),
          },
        },
      },
    },
  });
};

// biome-ignore lint/suspicious/noExplicitAny: Needs to be general
export const createExecuteRouter = (contracts: VersionedArvoContract<any, any>[]) => {
  const api = new OpenAPIHono();

  for (const contract of contracts) {
    const route = createContractRouteSpec(contract);
    api.openapi(route, async (c) => {
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

        // biome-ignore lint/suspicious/noExplicitAny: A hono limitation
        const data: any = c.req.valid('json');
        const event = createEventFromHono(data.data, contract);
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
  }

  return api;
};
