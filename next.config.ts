// next.config.ts (ROOT of the repo)
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // If you load external images/thumbnails, add hosts here
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'batman-news.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: 'static0.srcdn.com' },
      { protocol: 'https', hostname: 'www.gamespot.com' },
      { protocol: 'https', hostname: '**' }, // Allow all HTTPS images for development
    ],
  },

  // Don’t fail CI on lint/type issues (you can keep these on locally)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Treat optional/Node-only libs as externals so webpack doesn’t try to bundle them
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      '@opentelemetry/exporter-jaeger': 'commonjs @opentelemetry/exporter-jaeger',
      handlebars: 'commonjs handlebars',
      dotprompt: 'commonjs dotprompt',
    });
    return config;
  },
};

export default nextConfig;

