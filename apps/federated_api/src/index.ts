import { llmOrchestrator } from '@repo/contracts/orchestrators';
import { openaiCompletions, anthropicCompletions } from '@repo/contracts/services';
import type { VersionedArvoContract } from 'arvo-core';
import {} from 'arvo-xstate';
import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { createFederatedAPI } from './createFederatedAPI/index.js';
import { createExecuteRouter } from './createExecuteRouter/index.js';

// biome-ignore lint/suspicious/noExplicitAny: Needs to be general
const enabledContracts: VersionedArvoContract<any, any>[] = [
  llmOrchestrator.version('1.0.0'),
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
