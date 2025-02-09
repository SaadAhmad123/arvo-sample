import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/genaiModels.ts',
    'src/services/index.ts',
    'src/orchestrators/index.ts',
    'src/streams/index.ts',
  ],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  minify: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
});
