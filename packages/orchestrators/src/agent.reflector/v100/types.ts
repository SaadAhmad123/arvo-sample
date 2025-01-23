import type { reflectorAgentOrchestrator } from '@repo/contracts/orchestrators';
import type { ArvoErrorSchema, InferVersionedArvoContract, VersionedArvoContract } from 'arvo-core';
import type { z } from 'zod';

type ContractType = InferVersionedArvoContract<VersionedArvoContract<typeof reflectorAgentOrchestrator, '1.0.0'>>;
type ContractResultType = NonNullable<ContractType['emits']['arvo.orc.agent.reflector.done']['data']['result']> 

export type Generation = ContractResultType['generations'][number];
export type Critique = Generation['critique'][number];


export type ReflectorAgentContext = {
  initSubject$$: string;
  status: 'success' | 'error' | null;
  errors: z.infer<typeof ArvoErrorSchema>[];
  configuration: ContractType['accepts']['data'];
  generations: Generation[];
  currentIteration: number;
  maxIterations: number;
  rawGenerations: {
    valid_json: boolean | null
    content: string 
    total_tokens: number
  }[];
};
