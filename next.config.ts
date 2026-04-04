import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  staticPageGenerationTimeout: 120,

  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  
eslint: {
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;