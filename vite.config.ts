import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Increase the warning limit to avoid unnecessary warnings for large libraries like mapbox
    chunkSizeWarningLimit: 1600,
    
    // Ensure public files like _redirects are copied to the build output
    outDir: 'dist',
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        // Split chunks by dependency for better caching
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          mapbox: ['mapbox-gl'],
          supabase: ['@supabase/supabase-js'],
          vendor: ['posthog-js', 'resend'],
        },
      },
    },
  },
});
