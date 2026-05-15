import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Calorie Tracker',
    short_name: 'CalTracker',
    description:
      'Ultra-fast calorie tracking using AI photo and text analysis.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF6F1',
    theme_color: '#5C6B4F',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
