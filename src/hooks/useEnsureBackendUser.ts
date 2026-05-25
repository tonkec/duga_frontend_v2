import { apiClient } from '@app/api';
import { register } from '@app/api/auth/register';
import { resolveAuth0AccessToken } from '@app/api/authToken';
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

export const useEnsureBackendUser = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { user: auth0User, isAuthenticated, isLoading: isAuthLoading } = useAuth0();

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      if (!auth0User) throw new Error('Auth0 user not available');
      if (!auth0User.email) throw new Error('Auth0 email not available');

      const auth0AccessToken = await resolveAuth0AccessToken();
      const client = apiClient(auth0AccessToken ?? undefined);

      await register(
        auth0User.sub,
        auth0User.email,
        generateUniqueUsername(),
        Boolean(auth0User.email_verified),
        auth0AccessToken
      );
      const res = await client.get('/users/current-user', {
        skipGlobalErrorHandler: true,
      });
      return res.data;
    },
    enabled: enabled && !isAppSessionRevoked() && isAuthenticated && !isAuthLoading && !!auth0User,
    throwOnError: false,
  });
};
