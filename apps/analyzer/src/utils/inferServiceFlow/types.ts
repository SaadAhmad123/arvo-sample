export type EventFlowItem = {
  flow: 'ingress' | 'egress';
  type: string;
};

export type ServiceFlow = {
  name: string;
  handledEventType: string;
  type: 'service' | 'orchestrator';
  handlers: {
    version: string;
    contracts: {
      self: {
        uri: string;
        version: string;
        dataschema: string;
        events: EventFlowItem[];
      };
      services: {
        uri: string;
        version: string;
        dataschema: string;
        events: EventFlowItem[];
      }[];
    };
  }[];
};
