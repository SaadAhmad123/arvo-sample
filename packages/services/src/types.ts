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
};

export type EventHandlerFactoryParams<
  TSettingKeys extends keyof ServiceSettings = keyof ServiceSettings,
  TStreamContract extends InferVersionedArvoContract<
    VersionedArvoContract<ArvoContract, ArvoSemanticVersion>
  > = InferVersionedArvoContract<VersionedArvoContract<ArvoContract, ArvoSemanticVersion>>,
> = {
  settings: () => Promise<Pick<ServiceSettings, TSettingKeys>>;
  streamer?: (data: TStreamContract['accepts'], event: ArvoEvent) => Promise<void>;
};
