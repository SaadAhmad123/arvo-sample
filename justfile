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

# Run the biome formatter over the code
format:
  pnpm run format

# Run the biome linter over the code
lint:
  pnpm run lint