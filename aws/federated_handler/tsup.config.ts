import { defineConfig } from 'tsup'
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node19',
  platform: 'node',
  sourcemap: false,
  clean: true,
  bundle: true,
  minify: true,
  dts: false,
  outDir: 'dist',
  noExternal: [/.*/],
  external: [/@aws-sdk\/*/],
  treeshake: true,
  splitting: false,
  outExtension: () => ({
    js: '.mjs'
  }),
  esbuildOptions(options) {
    options.mainFields = ['module', 'main']
    options.banner = {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`
    }
  }
})