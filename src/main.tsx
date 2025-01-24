import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router';
import DugaRoutes from './routes/index.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketProvider.tsx';
import { Auth0Provider } from '@auth0/auth0-react';
import history from './utils/history.ts';
import { getConfig } from './auth0Config.ts';

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

const config = getConfig();

type AppState = {
  returnTo?: string;
  [key: string]: string | undefined;
};

const onRedirectCallback = (appState: AppState | undefined) => {
  history.push(appState && appState.returnTo ? appState.returnTo : window.location.pathname);
};

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(config.audience ? { audience: config.audience } : null),
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Auth0Provider {...providerConfig}>
          <SocketProvider>
            <DugaRoutes />
          </SocketProvider>
        </Auth0Provider>
        <ToastContainer />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
