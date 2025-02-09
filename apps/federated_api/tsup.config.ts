import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node19',
  platform: 'node',
  sourcemap: false,
  clean: true,
  bundle: true,
  minify: true,
  dts: false,
  outDir: 'dist',
  noExternal: [/.*/],
  treeshake: true,
  splitting: false,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
    options.banner = {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
    };
  },
});
