import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.43.197'],
  // Ensure g4f and proxy packages are NEVER bundled into client-side JS
  serverExternalPackages: [
    '@gpt4free/g4f.dev',
    'https-proxy-agent',
    'socks-proxy-agent',
  ],
  // Security headers to prevent g4f detection
  async headers() {
    return [
      {
        source: '/api/ai/:path*',
        headers: [
          { key: 'X-Powered-By', value: 'INIXA AI Engine' },
          { key: 'X-AI-Provider', value: 'INIXA' },
        ],
      },
    ];
  },
};

export default nextConfig;

