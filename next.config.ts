
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'assets-prd.ignimgs.com' },
      { protocol: 'https', hostname: 'www.dc.com' },
      { protocol: 'https', hostname: 'www.gamespot.com' },
      { protocol: 'https', hostname: 'static1.srcdn.com' },
      { protocol: 'https', hostname: 'www.cbr.com' },
      { protocol: 'https', hostname: 'cdn.vox-cdn.com' },
      { protocol: 'https', hostname: '**.akamaized.net' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: 'img.youtube.com' }
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
        '*.cloudworkstations.dev'
    ]
  }
};

export default nextConfig;
