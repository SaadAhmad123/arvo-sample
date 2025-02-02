'use client';

import {
  BlockSeparator,
  Container,
  ContentContainer,
  HeadingSeparator,
  ParagraphSeparator,
  PrimaryContainer,
} from '@repo/material-ui';
import * as Orchestrators from '@repo/orchestrators';
import * as Services from '@repo/services';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { v4 as uuid4 } from 'uuid';
import type { GraphData, GraphEdge, GraphNode } from '../components/GraphViz/types';
import { inferEventFlow } from '../utils/inferEventFlow';
import type { EventFlow } from '../utils/inferEventFlow/types';
import Image from 'next/image';
import { useWindowSize } from '@repo/material-ui/hooks';
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
  const windowSize = useWindowSize({ height: 20, width: 20 });
  return (
    <>
      <Container>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
          <PrimaryContainer>
            <h1 className='text-5xl sm:text-6xl font-bold'>System Analyzer</h1>
            <HeadingSeparator />
            <p className='sm:text-lg'>
              Arvo enables automatic system analysis by scanning <strong>service contracts</strong> and{' '}
              <strong>orchestrator definitions</strong> to generate a complete map of your distributed system. Through{' '}
              static analysis of contracts and event flows, it reveals the exact communication patterns and dependencies{' '}
              between services, providing engineers and architects with a precise, code-derived understanding of their{' '}
              <strong>systems architecture</strong>.
            </p>
          </PrimaryContainer>
          <Image
            alt='artwork-1'
            src='/graph-network-art-clipped.png'
            className='rounded-3xl h-full'
            width={100000} // NextJS image sizeing issue
            height={100000} // NextJS image sizeing issue
          />
        </div>
        <BlockSeparator />
        <ContentContainer>
          <>
            <h1 className='text-3xl sm:text-4xl font-bold'>Understand Your Service Communication Through Code</h1>
            <HeadingSeparator />
            <p>
              Arvo reveals service relationships through its explicit contracts and orchestrator definitions, creating a
              clear map of your distributed system. Every service interaction, event flow, and workflow dependency is
              captured in your code, making system communication patterns visible and analyzable.
              <ParagraphSeparator />
              This static analysis tool reads these definitions directly from your codebase, traversing orchestrators
              and their contracts to build a real-time view of your service communication patterns. Below you can
              explore the generated graph showing how your services interact and communicate through events:
            </p>
          </>
        </ContentContainer>
      </Container>
      <BlockSeparator />
      <Container>
        <div
          className='flex h-[450px] sm:h-[500px] md:h-[900px] xl:h-[1200px] shadow-elevation-2 rounded-3xl overflow-hidden'
          style={{ width: windowSize.width < 760 ? windowSize.width - 20 : Math.min(windowSize.width - 120, 1760) }}
        >
          <div className='flex flex-1 z-0'>
            <GraphViz data={graphData} nodeSize={56} backgroundColor='#f9f9f9 ' />
          </div>
        </div>
      </Container>
      <BlockSeparator />
    </>
  );
}

/*

        
      </div>
      <pre className='text-on-background'>{JSON.stringify(serviceEventFlow, null, 2)}</pre>
*/
