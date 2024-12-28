import type { ArvoEvent } from 'arvo-core';

export type ServiceSettings = {
  OPENAI_API_KEY: string;
  OPENAI_ORG_ID: string;
  OPENAI_PROJECT_ID: string;
};

export type EventHandlerFactoryParams = {
  settings: () => Promise<ServiceSettings>;
  streamer?: (data: Record<string, unknown>, event: ArvoEvent) => Promise<void>;
};
