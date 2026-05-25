import { ReactNode, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Loader from '@app/components/Loader';
import { register } from '@app/api/auth/register';
import { startSession } from '@app/api/sessions';
import {
  clearAppSessionRevoked,
  consumeAppSessionRevokedNotice,
  isAppSessionConflictError,
  isAppSessionRevoked,
  markSessionRevoked,
  SESSION_REVOKED_EVENT,
  getAppSessionId,
} from '@app/api/appSession';
import { AppSessionContext, AppSessionStatus } from '@app/context/AppSessionContext';
import { generateUniqueUsername } from '@app/hooks/useEnsureBackendUser';
import { toastConfig } from '@app/configs/toast.config';

type CypressWindow = Window &
  typeof globalThis & {
    Cypress?: unknown;
  };

const CYPRESS_SKIP_SESSION_START_KEY = 'duga:cypress-skip-session-start';
const SESSION_REVOKED_MESSAGE = 'Odjavljeni ste jer je račun otvoren u drugoj sesiji.';

const AppSessionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, logout, user } = useAuth0();
  const queryClient = useQueryClient();
  const startedSessionKeyRef = useRef<string | null>(null);
  const [status, setStatus] = useState<AppSessionStatus>(() =>
    isAppSessionRevoked() ? 'revoked' : 'loading'
  );

  useEffect(() => {
    const onRevoked = () => {
      queryClient.clear();
      setStatus('revoked');
      toast.info(SESSION_REVOKED_MESSAGE, toastConfig);
      logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    };

    window.addEventListener(SESSION_REVOKED_EVENT, onRevoked);
    return () => window.removeEventListener(SESSION_REVOKED_EVENT, onRevoked);
  }, [logout, queryClient]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      startedSessionKeyRef.current = null;
      if (consumeAppSessionRevokedNotice()) {
        toast.info(SESSION_REVOKED_MESSAGE, toastConfig);
      }
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

    const sessionKey = `${user.sub}:${getAppSessionId()}`;
    if (startedSessionKeyRef.current === sessionKey) {
      setStatus('active');
      return;
    }

    let cancelled = false;
    startedSessionKeyRef.current = sessionKey;
    setStatus('loading');

    const startAppSession = async () => {
      try {
        await register(
          user.sub!,
          user.email!,
          generateUniqueUsername(),
          Boolean(user.email_verified)
        );
        startedSessionKeyRef.current = `${user.sub}:${getAppSessionId()}`;
        await startSession();
        if (!cancelled) {
          setStatus('active');
        }
      } catch (error) {
        if (isAppSessionConflictError(error)) {
          markSessionRevoked();
          return;
        }

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
