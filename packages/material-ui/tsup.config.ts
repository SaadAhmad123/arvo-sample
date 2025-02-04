import { defineConfig } from 'tsup';

export default defineConfig({
  banner: {
    js: `"use client"`,
  },
  entry: ['src/**/*.{ts,tsx}'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
  splitting: false,
  sourcemap: true,
  external: ['react', 'react-dom', 'framer-motion'],
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  },
});
