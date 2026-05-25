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
        <ScrollToTop />
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
          <ToastContainer
            position="top-right"
            autoClose={4000}
            closeOnClick
            pauseOnHover
            closeButton
            toastClassName={() =>
              'relative flex min-h-16 overflow-hidden rounded-3xl border border-[#dce4ff] bg-white px-4 py-3 text-sm font-semibold leading-6 text-gray-950 shadow-xl shadow-blue-dark/10'
            }
            progressClassName={() => '!bg-blue'}
          />
        </QueryClientProvider>
      </BrowserRouter>
    </CookiesProvider>
  </StrictMode>
);
