import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['framer-motion', 'three', '@react-three/fiber', '@react-three/drei']
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader']
    });
    return config;
  },
  // PWA configuration
  ...(process.env.NODE_ENV === 'production' && {
    swcMinify: true,
    compress: true,
    poweredByHeader: false
  })
};

export default nextConfig;
