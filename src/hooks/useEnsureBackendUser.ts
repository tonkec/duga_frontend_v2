import { apiClient } from '@app/api';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { generate } from 'random-words';
import { isAppSessionRevoked } from '@app/api/appSession';

export const generateUniqueUsername = (): string => {
  const [word] = generate({ exactly: 1, formatter: (w) => w.toLowerCase() });
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const username = `${word}-${randomNumber}`;
  return username;
};

export const useCurrentBackendUser = ({
  enabled = true,
  requireAuth0 = true,
}: { enabled?: boolean; requireAuth0?: boolean } = {}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth0();
  const auth0Ready = requireAuth0 ? isAuthenticated && !isAuthLoading : !isAuthLoading;

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const client = apiClient();
      const res = await client.get('/users/current-user', {
        skipGlobalErrorHandler: true,
      });
      return res.data;
    },
    enabled: enabled && !isAppSessionRevoked() && auth0Ready,
    throwOnError: false,
  });
};
