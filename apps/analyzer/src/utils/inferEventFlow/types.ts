/**
 * Represents the event flow characteristics within a contract,
 * including direction, type, and contract metadata
 */
export type EventFlowItem = {
  flow: 'ingress' | 'egress';
  type: string;
  contract: {
    uri: string;
    version: string;
    dataschema: string;
  };
};

/**
 * Defines the structure of an event processor (service or orchestrator)
 * including its metadata and associated events
 */
export type EventFlow = {
  group: string;
  name: string;
  type: 'orchestrator' | 'service';
  events: EventFlowItem[];
};
