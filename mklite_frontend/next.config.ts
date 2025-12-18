import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // Acepta imágenes HTTP de cualquier sitio (solo para desarrollo)
      },
      {
        protocol: 'https',
        hostname: '**', // Acepta imágenes HTTPS de cualquier sitio
      },
    ],
  },
};

export default nextConfig;