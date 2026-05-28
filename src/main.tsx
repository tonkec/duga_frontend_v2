import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router';
import DugaRoutes from './routes/index.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketProvider.tsx';
import { Auth0ProviderWithNavigate } from './Auth0ProviderWithNavigate.tsx';
import AuthTokenBridge from './components/AuthTokenBridge/index.tsx';
import { CookiesProvider } from 'react-cookie';
import AppSessionProvider from './components/AppSessionProvider/index.tsx';
import axios from 'axios';
import { isSessionConflictCode } from './api/appSession.ts';
import ScrollToTop from './components/ScrollToTop/index.tsx';
import ThemePreferenceSync from './components/ThemePreferenceSync/index.tsx';
import ErrorBoundary from './components/ErrorBoundary/index.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      throwOnError: (error) =>
        !(axios.isAxiosError(error) && isSessionConflictCode(error.response?.data?.code)),
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookiesProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <ThemePreferenceSync />
          <QueryClientProvider client={queryClient}>
            <Auth0ProviderWithNavigate>
              <AuthTokenBridge>
                <AppSessionProvider>
                  <SocketProvider>
                    <DugaRoutes />
                  </SocketProvider>
                </AppSessionProvider>
              </AuthTokenBridge>
            </Auth0ProviderWithNavigate>
            <ReactQueryDevtools />
            <ToastContainer position="top-right" autoClose={3000} />
          </QueryClientProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </CookiesProvider>
  </StrictMode>
);
