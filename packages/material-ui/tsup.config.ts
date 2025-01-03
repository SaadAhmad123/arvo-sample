import { defineConfig } from 'tsup';

export default defineConfig({
  banner: {
    js: `"use client"`,
  },
  entry: ['src/**/*.{ts,tsx}'],
  format: ['esm'],
  dts: true,
  minify: true,
  splitting: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  },
});
