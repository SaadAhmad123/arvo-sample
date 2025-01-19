import { createRoute } from '@hono/zod-openapi';
import { EventDataschemaUtil, type VersionedArvoContract } from 'arvo-core';
import z from 'zod';

/**
 * Creates an OpenAPI route specification for POST endpoint from Arvo contracts.
 *
 * @param contracts - Array of VersionedArvoContract objects containing input/output schemas
 * @returns OpenAPI route spec with request/response validation schemas
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const createRouteSpec = (contracts: VersionedArvoContract<any, any>[]) => {
  // collect the input schema
  const routeInputSchema: unknown[] = contracts.map((item) =>
    z.object({
      dataschema: z.literal(EventDataschemaUtil.create(item)),
      data: item.accepts.schema,
    }),
  );

  // collect the output schema
  const routeOutputSchema: unknown[] = [];
  const contractTypeSeenForSystemError: Record<string, boolean> = {};
  for (const contract of contracts) {
    for (const [type, schema] of Object.entries(contract.emits)) {
      routeOutputSchema.push(
        z.object({
          type: z.literal(type),
          dataschema: z.literal(EventDataschemaUtil.create(contract)),
          data: schema as z.AnyZodObject,
        }),
      );
    }
    if (!contractTypeSeenForSystemError[contract.systemError.type]) {
      routeOutputSchema.push(
        z.object({
          type: z.literal(contract.systemError.type),
          dataschema: z.literal(EventDataschemaUtil.createWithWildCardVersion(contract)),
          data: contract.systemError.schema,
        }),
      );
      contractTypeSeenForSystemError[contract.systemError.type] = true;
    }
  }

  // create the route schema
  return createRoute({
    method: 'post',
    tags: ['Federated API'],
    path: '/',
    request: {
      body: {
        content: {
          'application/json': {
            // biome-ignore lint/suspicious/noExplicitAny: Zod limitation
            schema: z.union(routeInputSchema as any),
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
              event: z.union(routeOutputSchema as any),
              // biome-ignore lint/suspicious/noExplicitAny: Zod limitation
              history: z.union(routeOutputSchema as any).array(),
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
