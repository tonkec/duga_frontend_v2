import { apiClient } from '..';
import { resolveAuth0AccessToken } from '../authToken';

export const register = async (
  auth0Id: string,
  email: string,
  username: string,
  isVerified: boolean,
  token?: string | null
) => {
  const auth0AccessToken = token ?? (await resolveAuth0AccessToken());
  if (!auth0AccessToken) {
    return Promise.reject({
      response: {
        status: 401,
        data: { message: 'Not authenticated: Auth0 token missing' },
      },
    });
  }

  const client = apiClient(auth0AccessToken);
  return client.post(`/register`, {
    email,
    username,
    isVerified,
    auth0Id,
  });
};
