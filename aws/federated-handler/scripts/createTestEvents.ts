import { arvoToEventBridgeEvent } from '@aws/utilities';
import { llmOrchestrator } from '@repo/contracts/orchestrators';
import { createArvoEventFactory } from 'arvo-core';

console.log(
  JSON.stringify(
    arvoToEventBridgeEvent(
      createArvoEventFactory(llmOrchestrator.version('1.0.0')).accepts({
        source: 'com.test.test',
        data: {
          parentSubject$$: null,
          model: {
            provider: 'anthropic',
          },
          messages: [
            {
              role: 'user',
              content: 'HJello Wolrd',
            },
          ],
        },
      }),
    ),
    null,
    2,
  ),
);
