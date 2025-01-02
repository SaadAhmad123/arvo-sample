import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => ({
    ...config,
    externalsPresets: { node: true },
  }),
};

export default nextConfig;
