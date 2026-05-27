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

const getBootstrapSessionKey = (userSub: string) => `${userSub}:${getAppSessionId() ?? 'pending'}`;

const getStartedSessionKey = (userSub: string) => {
  const sessionId = getAppSessionId();
  return sessionId ? `${userSub}:${sessionId}` : null;
};

const AppSessionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, logout, user } = useAuth0();
  const queryClient = useQueryClient();
  const startedSessionKeyRef = useRef<string | null>(null);
  const startingSessionKeyRef = useRef<string | null>(null);
  const startingSessionPromiseRef = useRef<Promise<void> | null>(null);
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

    const startedSessionKey = getStartedSessionKey(user.sub);
    if (startedSessionKey && startedSessionKeyRef.current === startedSessionKey) {
      setStatus('active');
      return;
    }

    const sessionKey = getBootstrapSessionKey(user.sub);
    let cancelled = false;
    setStatus('loading');

    const handleBootstrapError = (error: unknown) => {
      if (isAppSessionConflictError(error)) {
        markSessionRevoked();
        return;
      }

      console.error('Error starting app session:', error);
      if (!cancelled) {
        setStatus('error');
      }
    };

    if (startingSessionKeyRef.current !== sessionKey || !startingSessionPromiseRef.current) {
      startingSessionKeyRef.current = sessionKey;
      startingSessionPromiseRef.current = (async () => {
        await register(
          user.sub!,
          user.email!,
          generateUniqueUsername(),
          Boolean(user.email_verified)
        );
        await startSession();
        const nextStartedSessionKey = getStartedSessionKey(user.sub!);
        if (!nextStartedSessionKey) {
          throw new Error('Backend session id not available');
        }
        startedSessionKeyRef.current = nextStartedSessionKey;
      })().finally(() => {
        if (startingSessionKeyRef.current === sessionKey) {
          startingSessionKeyRef.current = null;
          startingSessionPromiseRef.current = null;
        }
      });
    }

    startingSessionPromiseRef.current
      .then(() => {
        if (!cancelled) {
          setStatus('active');
        }
      })
      .catch(handleBootstrapError);

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
