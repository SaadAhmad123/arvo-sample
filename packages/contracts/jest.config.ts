import type { Config } from 'jest';

const config: Config = {
  displayName: 'Contracts',
  testEnvironment: 'node',
  clearMocks: true,
  verbose: true,
  collectCoverage: true,
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.ts', '!**/*.spec.ts'],
  testMatch: ['**/*.spec.ts'],

  // Tell Jest to treat .ts files as ES Modules instead of CommonJS
  // Without this, Jest wouldn't know these files use 'import/export' syntax
  extensionsToTreatAsEsm: ['.ts'],

  // In NodeNext, when TypeScript import files, it adds .js extensions to imports
  // e.g., import './file' becomes import './file.js'
  // This regex removes the .js extension so Jest can find the actual TypeScript files
  // ^(\\.{1,2}/.*)\.js$ breaks down to:
  // ^ - start of string
  // (\\.{1,2}/) - matches ./ or ../ (captured in $1)
  // .*        - matches rest of the path
  // \.js$     - matches .js at the end
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Configure how TypeScript files should be transformed for Jest
  // - Matches any .ts or .tsx file
  // - Uses ts-jest to transform them
  // - Enables ES Modules support in the transformer
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
