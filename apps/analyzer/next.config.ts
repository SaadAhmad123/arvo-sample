import type { NextConfig } from 'next';
import { webpack } from 'next/dist/compiled/webpack/webpack';

const nextConfig: NextConfig = {
  // output: 'export',
  // images: {
  //   loader: 'custom',
  //   loaderFile: './scripts/imageLoader.js',
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Provide polyfills for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
        zlib: require.resolve('browserify-zlib'),
      };

      // Add plugin to inject process
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      );
    }

    return config;
  },
  transpilePackages: [
    '@mui/icons-material',
    '@mui/material',
    '@material/material-color-utilities',
    'force-graph',
    '@repo/material-ui',
  ],
};

export default nextConfig;
