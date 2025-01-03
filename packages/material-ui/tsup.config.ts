import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  minify: true,
  treeshake: true,
  external: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  },
});
