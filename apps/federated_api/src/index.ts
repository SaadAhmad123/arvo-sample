import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { llmOrchestrator, reflectorAgentOrchestrator } from '@repo/contracts/orchestrators';
import { anthropicCompletions, openaiCompletions } from '@repo/contracts/services';
import type { VersionedArvoContract } from 'arvo-core';
import {} from 'arvo-xstate';
import { createExecuteRouter } from './createExecuteRouter/index.js';
import { createFederatedAPI } from './createFederatedAPI/index.js';
import { telemetrySdkStart } from 'src/commons/otel.js';
telemetrySdkStart();

// biome-ignore lint/suspicious/noExplicitAny: Needs to be general
const enabledContracts: VersionedArvoContract<any, any>[] = [
  llmOrchestrator.version('1.0.0'),
  reflectorAgentOrchestrator.version('1.0.0'),
  openaiCompletions.version('1.0.0'),
  anthropicCompletions.version('1.0.0'),
];

const app = new OpenAPIHono();
app.route('/federated', createFederatedAPI(enabledContracts));
app.route('/execute', createExecuteRouter(enabledContracts));
app.doc('/openapi', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Icarus | Federated API',
  },
});
app.get('/docs', swaggerUI({ url: '/openapi' }));

serve({
  fetch: app.fetch,
  port: 8001,
});
