import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GymFlow — Smart Workout Tracker',
    short_name: 'GymFlow',
    description: 'Mobile-first Progressive Web App for gym routine execution and progressive overload tracking',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait',
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
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Start Workout',
        short_name: 'Train',
        description: "Jump straight into today's workout session",
        url: '/workout/quick-start',
        icons: [{ src: '/icons/icon.svg', sizes: '96x96' }],
      },
      {
        name: 'My Routines',
        short_name: 'Routines',
        description: 'View and edit workout routines',
        url: '/routines',
        icons: [{ src: '/icons/icon.svg', sizes: '96x96' }],
      },
    ],
    categories: ['fitness', 'health', 'lifestyle'],
  };
}
