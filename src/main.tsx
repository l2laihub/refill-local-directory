import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import posthog from 'posthog-js';
import App from './App';
import './index.css';

// Initialize PostHog for analytics
const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

if (posthogApiKey) {
  posthog.init(posthogApiKey, {
    api_host: posthogHost,
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        // In development, disable capturing analytics
        posthog.opt_out_capturing();
      }
    }
  });
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
