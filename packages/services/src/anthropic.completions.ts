import { anthropicCompletions as anthropicCompletionsContract } from '@repo/contracts/services';
import { type EventHandlerFactory, createArvoEventHandler } from 'arvo-event-handler';
import { serviceRate } from './commons/ratecards/service.js';
import type { EventHandlerFactoryParams } from './types.js';

export const anthropicCompletions: EventHandlerFactory<EventHandlerFactoryParams> = (param) =>
  createArvoEventHandler({
    contract: anthropicCompletionsContract,
    executionunits: serviceRate(),
    handler: {
      '1.0.0': async () => {},
    },
  });
