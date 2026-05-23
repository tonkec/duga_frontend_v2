import { ReactNode, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient } from '@tanstack/react-query';
import Loader from '@app/components/Loader';
import { register } from '@app/api/auth/register';
import { startSession } from '@app/api/sessions';
import {
  clearAppSessionRevoked,
  isAppSessionRevoked,
  SESSION_REVOKED_EVENT,
} from '@app/api/appSession';
import { AppSessionContext, AppSessionStatus } from '@app/context/AppSessionContext';
import { generateUniqueUsername } from '@app/hooks/useEnsureBackendUser';

type CypressWindow = Window &
  typeof globalThis & {
    Cypress?: unknown;
  };

const CYPRESS_SKIP_SESSION_START_KEY = 'duga:cypress-skip-session-start';

const AppSessionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AppSessionStatus>(() =>
    isAppSessionRevoked() ? 'revoked' : 'loading'
  );

  useEffect(() => {
    const onRevoked = () => {
      queryClient.clear();
      setStatus('revoked');
    };

    window.addEventListener(SESSION_REVOKED_EVENT, onRevoked);
    return () => window.removeEventListener(SESSION_REVOKED_EVENT, onRevoked);
  }, [queryClient]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      clearAppSessionRevoked();
      setStatus('active');
      return;
    }

    if (isAppSessionRevoked()) {
      setStatus('revoked');
      return;
    }

    if (
      (window as CypressWindow).Cypress &&
      localStorage.getItem(CYPRESS_SKIP_SESSION_START_KEY) === 'true'
    ) {
      setStatus('active');
      return;
    }

    if (!user?.sub || !user.email) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    const startAppSession = async () => {
      try {
        await register(
          user.sub!,
          user.email!,
          generateUniqueUsername(),
          Boolean(user.email_verified)
        );
        await startSession();
        if (!cancelled) {
          setStatus('active');
        }
      } catch (error) {
        console.error('Error starting app session:', error);
        if (!cancelled) {
          setStatus('error');
        }
      }
    };

    startAppSession();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, user]);

  if (isLoading || (isAuthenticated && status === 'loading')) {
    return <Loader />;
  }

  return <AppSessionContext.Provider value={status}>{children}</AppSessionContext.Provider>;
};

export default AppSessionProvider;
