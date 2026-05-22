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

export const useEnsureBackendUser = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { user: auth0User, isAuthenticated, isLoading: isAuthLoading } = useAuth0();

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      if (!auth0User) throw new Error('Auth0 user not available');

      const client = apiClient();

      const input = {
        email: auth0User.email,
        username: generateUniqueUsername(),
        isVerified: auth0User.email_verified,
        auth0Id: auth0User.sub,
      };

      await client.post('/register', input);
      const res = await client.get('/users/current-user');
      return res.data;
    },
    enabled: enabled && !isAppSessionRevoked() && isAuthenticated && !isAuthLoading && !!auth0User,
    throwOnError: false,
  });
};
