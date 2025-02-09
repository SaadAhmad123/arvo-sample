import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/commons/index.ts'],
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
