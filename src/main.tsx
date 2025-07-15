import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import './styles/Home.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

/**
 * Main entry point for the React application.
 * This file is responsible for:
 * 1. Importing global styles.
 * 2. Setting up React Query for optimal data fetching and caching.
 * 3. Importing the root application component (`App`).
 * 4. Finding the root DOM element.
 * 5. Rendering the `App` component into the DOM using React's `createRoot` API,
 *    wrapped in `StrictMode` for development checks.
 */

// ✅ OPTIMIZED: Configure React Query for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep cache for 10 minutes (gcTime is the new name for cacheTime)
      gcTime: 10 * 60 * 1000,
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
); 