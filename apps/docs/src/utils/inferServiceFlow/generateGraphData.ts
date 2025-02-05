import { v4 as uuid4 } from 'uuid';
import type { GraphData, GraphEdge, GraphNode } from '../../components/GraphViz/types';
import type { ServiceFlow } from './types';

const handlerNameBuilder = (flow: ServiceFlow, handler: ServiceFlow['handlers'][number]) =>
  `${flow.type === 'orchestrator' ? 'Orchestrator' : 'Handler'} - ${flow.handledEventType} (v${handler.version})`;

export const generateGraphData = (serviceFlow: ServiceFlow[]): GraphData => {
  const edges: GraphEdge[] = [];
  const nodes: GraphNode[] = [];
  const contractNodeIdMap: Record<string, string> = {};
  const handlerNodeIdMap: Record<string, string> = {};

  for (const item of serviceFlow) {
    const group = item.name;
    const serviceNodeId = uuid4();
    nodes.push({
      id: serviceNodeId,
      group: group,
      title: `Service - ${item.name}`,
    });
    for (const handler of item.handlers) {
      const handlerNodeId = uuid4();
      const handlerTitle = handlerNameBuilder(item, handler);
      handlerNodeIdMap[handlerTitle] = handlerNodeId;
      nodes.push({
        id: handlerNodeId,
        group: group,
        title: handlerTitle,
        style: {
          shape: 'box',
          color: {
            background: {
              default: '#3498DB',
            },
            text: {
              default: 'white',
            },
          },
        },
      });
      edges.push({
        id: uuid4(),
        source: serviceNodeId,
        target: handlerNodeId,
        title: 'Registered at',
        direction: 'bidirectional',
        lineType: 'dotted',
      });
      const contractNodeId = uuid4();
      nodes.push({
        id: contractNodeId,
        group: group,
        title: `Contract - ${handler.contracts.self.dataschema}`,
        style: {
          shape: 'box',
          color: {
            background: {
              default: '#F1C40F',
            },
            text: {
              default: 'black',
            },
          },
        },
      });
      edges.push({
        id: uuid4(),
        source: handlerNodeId,
        target: contractNodeId,
        title: 'Validated Bidirectional Data',
        direction: 'bidirectional',
        lineType: 'dotted',
      });
      contractNodeIdMap[handler.contracts.self.dataschema] = contractNodeId;
    }
  }

  for (const item of serviceFlow) {
    for (const handler of item.handlers) {
      const handlerNodeId = handlerNodeIdMap[handlerNameBuilder(item, handler)];
      for (const service of handler.contracts.services) {
        const contractNodeId = contractNodeIdMap[service.dataschema];
        for (const event of service.events) {
          const source = event.flow === 'egress' ? handlerNodeId : contractNodeId;
          const target = event.flow === 'egress' ? contractNodeId : handlerNodeId;
          edges.push({
            id: uuid4(),
            source: source,
            target: target,
            title: event.type,
            direction: 'unidirectional',
            lineType: 'solid',
          });
        }
      }
    }
  }

  return {
    edges,
    nodes,
  };
};
