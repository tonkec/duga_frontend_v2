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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <Auth0ProviderWithNavigate>
            <DugaRoutes />
          </Auth0ProviderWithNavigate>
        </SocketProvider>
        <ReactQueryDevtools />
        <ToastContainer />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
