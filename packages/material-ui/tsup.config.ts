import { defineConfig } from 'tsup';

export default defineConfig({
  banner: {
    js: `"use client"`,
  },
  entry: ['src/index.{ts,tsx}', 'src/hooks/index.{ts,tsx}'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
  splitting: true,
  sourcemap: true,
  clean: false,
  injectStyle: false,
  external: ['react', 'react-dom', 'framer-motion'],
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  },
  outDir: 'dist',
});
