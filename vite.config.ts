import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import VitePWA

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'], // Include necessary assets
      manifest: {
        name: 'RefillLocal - Find Refill & Zero-Waste Stores',
        short_name: 'RefillLocal',
        description: 'Discover local refill and zero-waste stores to shop plastic-free and live more sustainably.',
        theme_color: '#4A7C59',
        background_color: '#F8F6F2',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.png', // Path relative to public directory
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512x512.png', // Path relative to public directory
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'favicon.svg', // Assuming favicon.svg is in public
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          }
        ],
      },
      // Optional: configure workbox options for service worker
      // workbox: {
      //   globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      //   runtimeCaching: [
      //     {
      //       urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      //       handler: 'CacheFirst',
      //       options: {
      //         cacheName: 'google-fonts-cache',
      //         expiration: {
      //           maxEntries: 10,
      //           maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
      //         },
      //         cacheableResponse: {
      //           statuses: [0, 200]
      //         }
      //       }
      //     },
      //     // Add more caching strategies as needed
      //   ]
      // }
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
