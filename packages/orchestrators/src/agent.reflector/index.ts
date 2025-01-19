import type { EventHandlerFactory } from 'arvo-event-handler';
import { type IMachineMemory, type MachineMemoryRecord, createArvoOrchestrator } from 'arvo-xstate';
import { reflectorAgentMachineV100 } from './v100/index.js';

export const reflectorAgentOrchestrator: EventHandlerFactory<IMachineMemory<MachineMemoryRecord>> = (memory) =>
  createArvoOrchestrator({
    executionunits: 1 / 1e6,
    memory: memory,
    machines: [reflectorAgentMachineV100],
  });
