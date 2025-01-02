import type { EventHandlerFactory } from 'arvo-event-handler';
import { createArvoOrchestrator, type IMachineMemory, type MachineMemoryRecord } from 'arvo-xstate';
import { llmMachineV100 } from './v100.js';

export const llmOrchestrator: EventHandlerFactory<IMachineMemory<MachineMemoryRecord>> = (memory) =>
  createArvoOrchestrator({
    executionunits: 1 / 1e6,
    memory: memory,
    machines: [llmMachineV100],
  });
