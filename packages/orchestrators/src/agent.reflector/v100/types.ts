import type { reflectorAgentOrchestrator } from '@repo/contracts/orchestrators';
import type { ArvoErrorSchema, InferVersionedArvoContract, VersionedArvoContract } from 'arvo-core';
import type { z } from 'zod';

type ContractType = InferVersionedArvoContract<VersionedArvoContract<typeof reflectorAgentOrchestrator, '1.0.0'>>;

export type Critique = {
  criterion: string;
  satisfied: boolean;
  improvement: string | null;
};

export type ReflectorAgentContext = {
  initSubject$$: string;
  status: 'success' | 'error' | null;
  errors: z.infer<typeof ArvoErrorSchema>[];
  configuration: ContractType['accepts']['data'];
  generations: string[];
  json_valid: boolean | null;
  critiques: Critique[][];
  currentIteration: number;
  maxIterations: number;
  tokenUsage: Record<string, number>;
};
