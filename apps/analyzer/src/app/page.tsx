'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import {
  BlockSeparator,
  Card,
  Container,
  ContentContainer,
  HeadingSeparator,
  ParagraphSeparator,
  PrimaryContainer,
  Separator,
} from '@repo/material-ui';
import { useWindowSize } from '@repo/material-ui/hooks';
import * as Orchestrators from '@repo/orchestrators';
import * as Services from '@repo/services';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMemo } from 'react';
import { inferServiceFlow } from '../utils/inferServiceFlow';
import { generateGraphData } from '../utils/inferServiceFlow/generateGraphData';
const GraphViz = dynamic(() => import('../components/GraphViz/index').then((item) => item.GraphViz), { ssr: false });

export default function Home() {
  const serviceEventFlow = useMemo(
    () =>
      inferServiceFlow([
        ...Object.entries(Services).map(([name, handler]) => ({
          name: name,
          // biome-ignore lint/suspicious/noExplicitAny: We dont want to pass the original dependencies. We just want to create these
          handler: handler({} as any),
        })),
        ...Object.entries(Orchestrators).map(([name, handler]) => ({
          name: name,
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
            <HeadingSeparator />
            <Card>
              <div className='flex flex-col sm:!flex-row items-start gap-4'>
                <TipsAndUpdatesOutlinedIcon />
                <p>
                  This visualization represents logical service-to-service communication flows derived from your
                  contracts and orchestrator definitions. It shows how services interact through events rather than the
                  physical broker configuration or deployment topology
                </p>
              </div>
            </Card>
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
      <Container>
        <div className='flex items-center justify-start gap-4 text-3xl sm:text-4xl font-bold'>
          <InfoOutlinedIcon fontSize='large' />
          <h1>About The View</h1>
        </div>
        <HeadingSeparator />
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
          <Card>
            <div className='w-full border-b-4 border-dotted border-on-surface my-4 max-w-[100px]' />
            <Separator />
            <p className='text-lg'>Dotted Lines: Internal Service Communication</p>
            <br />
            <p className='text'>
              Dotted lines show how data flows within a service, connecting registered event handlers to the event
              communication channel. Each handler interacts with the system through its defined contract interface,
              ensuring type-safe and validated internal communication.
            </p>
          </Card>
          <Card>
            <div className='w-full border-b-4 border-on-surface my-4 max-w-[100px]' />
            <p className='text-lg'>Solid Lines: Inter-Service Event Flow</p>
            <br />
            <p className='text'>
              Solid lines represent event communication between services through the message broker. Each line shows a
              one-way flow of ArvoEvents, with the receiving service validating each event against its contract before
              processing. This ensures reliable and type-safe communication across service boundaries.
            </p>
          </Card>
        </div>
      </Container>
      <BlockSeparator />
    </>
  );
}
