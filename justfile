# Set shell based on OS
set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]
set shell := ["bash", "-cu"]

# Default recipe to run when just is called without arguments
default:
    @just --list

# List available recipes
help:
    @just --list

# Run pnpm build
build:
    pnpm run build

# Run pnpm install
install:
    pnpm install

# Run build and then install (for linking new code between packages)
link: build install

link_contract:
  pnpm run build --filter="@repo/contracts"
  pnpm install

# Run the biome formatter over the code
format:
  pnpm run format

# Run the biome linter over the code
lint:
  pnpm run lint

# Run the jest tests for all the packages
test:
  pnpm run test

# Run the Jeager docker image for OTel. The UI will be available on http://localhost:16686
run_jaeger:
  docker run --rm \
    -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
    -p 16686:16686 \
    -p 4317:4317 \
    -p 4318:4318 \
    -p 9411:9411 \
    jaegertracing/all-in-one:latest

# Run the federated API
run_api: 
  pnpm run build --filter="@app/federated_api"
  pnpm i
  pnpm run dev --filter="@app/federated_api"

# Upgrade all dependencies
upgrade:
  pnpm upgrade -r

# Upgrade only arvo dependencies
upgrade_arvo:
  pnpm upgrade arvo-core arvo-event-handler arvo-xstate -r

  # Run the Analyzer UI
run_analyzer: 
  pnpm run build --filter="@app/analyzer"
  pnpm i
  pnpm run dev --filter="@app/analyzer"