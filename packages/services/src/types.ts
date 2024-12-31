import type {
  ArvoContract,
  ArvoEvent,
  ArvoSemanticVersion,
  InferVersionedArvoContract,
  VersionedArvoContract,
} from 'arvo-core';

export type ServiceSettings = {
  OPENAI_API_KEY: string;
  OPENAI_ORG_ID: string;
  OPENAI_PROJECT_ID: string;

  ANTHROPIC_API_KEY: string;
};

export type EventHandlerFactoryParams<
  TSettingKeys extends keyof ServiceSettings = keyof ServiceSettings,
  // biome-ignore lint/suspicious/noExplicitAny: A bit hard to define the types
  TStreamContract extends VersionedArvoContract<any, any> = VersionedArvoContract<ArvoContract, ArvoSemanticVersion>,
> = {
  settings: () => Promise<Pick<ServiceSettings, TSettingKeys>>;
  streamer?: (data: InferVersionedArvoContract<TStreamContract>['accepts'], event: ArvoEvent) => Promise<void>;
};
