'use client';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import GroupsIcon from '@mui/icons-material/Groups';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  BlockSeparator,
  Button,
  Card,
  Container,
  ContentContainer,
  HeadingSeparator,
  PaddedContentContainer,
  ParagraphSeparator,
  PrimaryContainer,
} from '@repo/material-ui';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Container>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
          <PrimaryContainer>
            <h1 className='text-5xl sm:text-6xl font-bold'>
              <span className='text-secondary'>Meet,</span>
              <span className='ml-2'>Arvo</span>
            </h1>
            <HeadingSeparator />
            <p className='sm:text-lg'>
              To build for event-driven systems that scale with your vision. Arvo gives you the foundation for reliable
              event-driven communication, freeing your business logic to grow while deployment details fade into the
              background.
            </p>
            <div className='mt-8 flex gap-4'>
              <Button variant='filled' title='Getting Started' />
              <Button variant='outlined' title='View on GitHub' icon={<GitHubIcon />} />
            </div>
          </PrimaryContainer>
          <div className='w-full relative min-h-[300px] xl:min-h-[400px]'>
            <Image
              src='/arvo-hero-artwork.webp'
              alt='artwork-1'
              fill
              className='object-cover rounded-3xl'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              priority
            />
          </div>
        </div>
      </Container>
      <BlockSeparator />
      <Container>
        <PaddedContentContainer>
          <>
            <h1 className='text-3xl sm:text-4xl font-bold'>
              Build Applications Designed for Evolution and Reliability
            </h1>
            <HeadingSeparator />
            <p>
              Today{"'"}s technology landscape moves at lightning speed, with new platforms, tools, and paradigms
              emerging constantly. In this dynamic environment, your systems need to do more than just keep up – they
              need to evolve and thrive. Event-driven architectures excel at adapting to change, but they face their own
              challenges as systems grow more complex.
            </p>
            <ParagraphSeparator />
            <p>
              Arvo isn't just another framework &ndash; it's a fresh perspective on building evolutionary systems.
              Whether you're scaling a startup or transforming an enterprise, Arvo offers something valuable: code you
              can run, patterns you can adopt, or ideas that challenge how you think about event-driven architecture.
              It's designed for teams who believe that great systems aren't just built &ndash; they evolve.
            </p>
          </>
        </PaddedContentContainer>
      </Container>
      <BlockSeparator />
      <Container>
        <ContentContainer>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Card>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <AutoFixHighIcon className='text-secondary text-2xl' />
                  <h3 className='text-xl font-bold'>Evolution Made Simple</h3>
                </div>
                <p>
                  Arvo decouples your business logic from infrastructure concerns. Define features through versioned
                  contracts and flexible interfaces, while your system adapts across deployments - from single process
                  to serverless, without changing a line of business code.
                </p>
              </div>
            </Card>

            <Card>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <ShieldIcon className='text-secondary text-2xl' />
                  <h3 className='text-xl font-bold'>Rock-Solid Reliability</h3>
                </div>
                <p>
                  Build with confidence using our broker-centric architecture. Every event follows a standardized format
                  with guaranteed delivery. No more fragile point-to-point integrations - just clean, reliable
                  communication between services.
                </p>
              </div>
            </Card>

            <Card>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <AccountTreeIcon className='text-secondary text-2xl' />
                  <h3 className='text-xl font-bold'>Smart Orchestration</h3>
                </div>
                <p>
                  Coordinate complex workflows without the complexity. Arvo's state machine-based orchestration, powered
                  by XState, lets you manage sophisticated business processes while keeping services independent and
                  maintainable.
                </p>
              </div>
            </Card>
          </div>
        </ContentContainer>
      </Container>
      <BlockSeparator />
      <Container>
        <ContentContainer>
          <h2 className='text-3xl font-bold'>What Makes Arvo Special?</h2>
          <HeadingSeparator />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <CodeIcon className='text-secondary text-xl' />
                <h3 className='text-lg font-bold'>Type-Safe Contracts</h3>
              </div>
              <p>
                Define your event interfaces with full type safety using Zod schemas. Catch contract violations at
                compile time, ensuring reliable communication between services.
              </p>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <AutoModeIcon className='text-secondary text-xl' />
                <h3 className='text-lg font-bold'>Flexible Deployment</h3>
              </div>
              <p>
                Deploy how you want - single process, containers, microservices, or serverless. Your business logic
                remains unchanged while Arvo handles the infrastructure details.
              </p>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <MonitorHeartIcon className='text-secondary text-xl' />
                <h3 className='text-lg font-bold'>Built-in Observability</h3>
              </div>
              <p>
                Debug with confidence using OpenTelemetry integration. Track events across services, monitor
                performance, and quickly identify issues in your workflows.
              </p>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <SecurityIcon className='text-secondary text-xl' />
                <h3 className='text-lg font-bold'>Enterprise Ready</h3>
              </div>
              <p>
                Built for business-critical applications with features like access control, audit trails, and
                comprehensive error handling baked in from the start.
              </p>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <PrecisionManufacturingIcon className='text-secondary text-xl' />
                <h3 className='text-lg font-bold'>Standards Based</h3>
              </div>
              <p>
                Built on proven standards like CloudEvents and XState. Leverage existing tools and knowledge while
                getting the benefits of Arvo's enhancements.
              </p>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <GroupsIcon className='text-secondary text-xl' />
                <h3 className='text-lg font-bold'>Developer Experience</h3>
              </div>
              <p>
                Enjoy a first-class developer experience with clear contracts, helpful error messages, and comprehensive
                documentation to keep your team productive.
              </p>
            </div>
          </div>
        </ContentContainer>
      </Container>
      <BlockSeparator />
    </>
  );
}
