# Arvo Sample Project: Event-Driven System Demo

This project demonstrates how to build distributed systems using Arvo's state machines, contracts, and event-driven patterns. Through practical examples, you'll learn how to implement service communication, workflow orchestration, and system analysis in a modern distributed architecture.

## Project Overview

The project showcases a complete event-driven system built with Arvo. Experience how services communicate through contracts, observe workflow orchestration in action, and analyze system behavior through our visualization tools. With integrated OpenTelemetry support, you'll gain deep insights into system operations and service interactions.

## Getting Started

### Prerequisites
Your development environment should have:
- Node.js version 19 or higher
- pnpm package manager
- Docker (optional, required only for Jaeger tracing)

> You either need a linux/mac terminal or a Windows Powershell. This project tooling is design to run cross platform

### Setup
```bash
# clone the repo and choose the appropriate branch
# cd <Project directory>
nvm install 19 # Skip if you have nodejs >= 19
nvm use 19 # Skip if you have nodejs >= 19
npm i -g pnpm # Install the package manager
pnpm i # Install all dependencies
npx just link # Build and links monorepo dependencies
# Add the .env file in the project root as per the `.env.template` file
```

### Running Components

Start the API service to explore service interactions:
```bash
npx just run_api
```
Access Swagger documentation at `http://localhost:8001/docs`

Launch the System Analyzer to visualize your architecture:
```bash
npx just run_analyzer
```
View system analysis at `http://localhost:3000`

Monitor system behavior with Jaeger:
```bash
npx just run_jaeger
```
Access tracing at `http://localhost:16686`

## Project Structure

Our monorepo is organized into focused packages for clarity and reusability:

The `/packages` directory contains our core components:
- `contracts`: Service contract definitions and validations
- `services`: Implementation of our example services
- `orchestrators`: Workflow definitions and orchestration logic
- `utilities`: Shared helper functions and common code
- `material-ui`: Shared Material V3 UI components
- `tsconfig`: TypeScript configuration templates

The `/apps` directory hosts our runnable applications:
- `federated_api`: In-memory broker and service runtime
- `analyzer`: NextJS-based system analysis interface

## Development Tools

It is recommended to install the XState VSCode extension [XState VSCode](https://marketplace.visualstudio.com/items?itemName=statelyai.stately-vscode) for visualizing state machine definitions during development.

## Learning Path

Start your journey by exploring our examples and documentation:
1. Review the service implementations to understand Arvo patterns
2. Experiment with the analyzer to visualize system interactions
3. Use Jaeger to observe system behavior in real-time
4. Explore the documentation for in-depth understanding

## Arvo Framework documentation

The Arvo framework provides a cohesive set of libraries for building event-driven systems. While designed to work together seamlessly, each component remains independent - adopt what serves your needs and integrate at your own pace.
| Scope | NPM | Github | Documentation |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Orchestration | [arvo-xstate](https://www.npmjs.com/package/arvo-xstate?activeTab=readme) | [Source Code](https://github.com/SaadAhmad123/arvo-xstate) | [Docs](https://saadahmad123.github.io/arvo-xstate/index.html) |
| Core | [arvo-core](https://www.npmjs.com/package/arvo-core?activeTab=readme) | [Source Code](https://github.com/SaadAhmad123/arvo-core) | [Docs](https://saadahmad123.github.io/arvo-core/index.html) |
| Event Handling | [arvo-event-handler](https://www.npmjs.com/package/arvo-event-handler?activeTab=readme) | [Source Code](https://github.com/SaadAhmad123/arvo-event-handler) | [Docs](https://saadahmad123.github.io/arvo-event-handler/index.html) |

### Core Arvo Components
- **[ArvoEvent](https://saadahmad123.github.io/arvo-core/documents/ArvoEvent.html)**: A standardized event structure that extends CloudEvents, carrying contract validation, routing information, and OpenTelemetry context for reliable service communication.

- **[ArvoContract](https://saadahmad123.github.io/arvo-core/documents/ArvoContract.html)**: A type-safe definition of service interfaces that specifies accepted inputs and emitted outputs, enabling reliable evolution and static analysis of service interactions.

- **[ArvoEventHandler](https://saadahmad123.github.io/arvo-event-handler/documents/ArvoEventHandler.html)**: A stateless service component that processes ArvoEvents according to defined contracts, transforming inputs into outputs while maintaining reliability and type safety.

- **[ArvoOrchestrator](https://saadahmad123.github.io/arvo-xstate/documents/ArvoOrchestrator.html)**: A specialized event handler that executes [state machines](https://saadahmad123.github.io/arvo-xstate/documents/ArvoMachine__Core_Components_and_Event_Emission.html) to coordinate complex workflows, managing state persistence and parent-child relationships between processes.

These components work together to create reliable, analyzable, and evolvable distributed systems.