'use client';

import { ThemePicker } from '@repo/material-ui';
import * as Orchestrators from '@repo/orchestrators';
import * as Services from '@repo/services';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { v4 as uuid4 } from 'uuid';
import type { GraphData, GraphEdge, GraphNode } from '../components/GraphViz/types';
import { inferEventFlow } from '../utils/inferEventFlow';
import type { EventFlow } from '../utils/inferEventFlow/types';
const GraphViz = dynamic(() => import('../components/GraphViz/index').then((item) => item.GraphViz), { ssr: false });

const generateGraphData = (eventFlow: EventFlow[]): GraphData => {
  const graphEdges: GraphEdge[] = [];

  const nodeMap: Record<string, GraphNode> = Object.fromEntries(
    eventFlow.map((item) => [
      item.name,
      {
        group: item.group,
        title: item.name,
        id: uuid4(),
        style: {
          shape: 'box',
          color: {
            background: {
              default: '#93cdff',
            },
          },
        },
      } as GraphNode,
    ]),
  );

  const groupNodeMap: Record<string, GraphNode> = {};
  for (const node of Object.values(nodeMap)) {
    if (!groupNodeMap[node.group]) {
      groupNodeMap[node.group] = {
        id: uuid4(),
        title: `Event Handler [${node.group}]`,
        group: node.group,
      } as GraphNode;
    }
    graphEdges.push({
      source: groupNodeMap[node.group].id,
      target: node.id,
      title: 'Serves 1.0.0',
      direction: 'bidirectional',
      lineType: 'dotted',
    });
  }

  for (const service of eventFlow) {
    for (const event of service.events) {
      if (event.contract.dataschema === service.name) continue;
      if (!nodeMap[event.contract.dataschema].id) continue;
      const source = event.flow === 'egress' ? nodeMap[service.name].id : nodeMap[event.contract.dataschema].id;
      const target = event.flow === 'egress' ? nodeMap[event.contract.dataschema].id : nodeMap[service.name].id;
      graphEdges.push({
        direction: 'unidirectional',
        title: event.type,
        source: source,
        target: target,
        lineType: 'solid',
      });
    }
  }

  return {
    nodes: [...Object.values(nodeMap), ...Object.values(groupNodeMap)],
    edges: graphEdges,
  };
};

export default function Home() {
  const serviceEventFlow = useMemo(
    () =>
      inferEventFlow([
        ...Object.entries(Services).map(([name, handler]) => ({
          name: `service.${name}`,
          // biome-ignore lint/suspicious/noExplicitAny: We dont want to pass the original dependencies. We just want to create these
          handler: handler({} as any),
        })),
        ...Object.entries(Orchestrators).map(([name, handler]) => ({
          name: `orchestrators.${name}`,
          // biome-ignore lint/suspicious/noExplicitAny: We dont want to pass the original dependencies. We just want to create these
          handler: handler({} as any),
        })),
      ]),
    [],
  );

  const graphData = useMemo(() => generateGraphData(serviceEventFlow), [serviceEventFlow]);

  const handleNodeClick = (node: unknown) => {
    console.log('Node clicked:', node);
  };

  return (
    <>
      <div className='flex h-screen w-screen z-0 shadow-xl'>
        <GraphViz data={graphData} onNodeClick={handleNodeClick} nodeSize={56} backgroundColor='#f9f9f9 ' />
      </div>
      <pre className='text-on-background'>{JSON.stringify(serviceEventFlow, null, 2)}</pre>
      <ThemePicker />
    </>
  );
}
