import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router';
import DugaRoutes from './routes/index.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketProvider.tsx';
import { Auth0ProviderWithNavigate } from './Auth0ProviderWithNavigate.tsx';
import { CookiesProvider } from 'react-cookie';
import { ErrorBoundary } from './components/ErrorBoundary/index.tsx';
import Fallback from './components/ErrorBoundary/components/Fallback/index.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      throwOnError: true,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallback={<Fallback />}>
    <StrictMode>
      <CookiesProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <Auth0ProviderWithNavigate>
              <SocketProvider>
                <QueryErrorResetBoundary>
                  {() => (
                    <ErrorBoundary fallback={<Fallback />}>
                      <DugaRoutes />
                    </ErrorBoundary>
                  )}
                </QueryErrorResetBoundary>
              </SocketProvider>
            </Auth0ProviderWithNavigate>
            <ReactQueryDevtools />
            <ToastContainer />
          </QueryClientProvider>
        </BrowserRouter>
      </CookiesProvider>
    </StrictMode>
  </ErrorBoundary>
);
