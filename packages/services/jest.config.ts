import type { Config } from 'jest';

const config: Config = {
  displayName: 'Services',
  testEnvironment: 'node',
  clearMocks: true,
  verbose: true,
  collectCoverage: true,
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.ts', '!**/*.spec.ts'],
  testMatch: ['**/*.spec.ts'],

  // Tell Jest to treat .ts files as ES Modules instead of CommonJS
  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    // Handle ESM imports in TypeScript
    // When TypeScript compiles ESM modules, it adds .js extensions to imports
    // This regex removes them so Jest can find the original .ts files
    '^(\\.{1,2}/.*)\\.js$': '$1',

    // Handle workspace package resolution including subpath exports
    // The regex ^@repo/([^/]+)(/.*)?$ breaks down to:
    // - ^@repo/ - matches the workspace prefix exactly
    // - ([^/]+) - captures the package name (anything until the next slash)
    // - (/.*)?  - optionally captures any subpath including the leading slash
    // Examples:
    // @repo/utilities -> ../utilities/src
    // @repo/utilities/prompts -> ../utilities/src/prompts
    // @repo/contracts/services -> ../contracts/src/services
    '^@repo/([^/]+)(/.*)?$': '<rootDir>/../$1/src$2',
  },

  // Configure TypeScript transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};

export default config;
