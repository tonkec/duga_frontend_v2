import { apiClient } from '.';
import { resolveAuth0AccessToken } from './authToken';

export const startSession = async () => {
  const auth0AccessToken = await resolveAuth0AccessToken();
  if (!auth0AccessToken) {
    return Promise.reject({
      response: {
        status: 401,
        data: { message: 'Not authenticated: Auth0 token missing' },
      },
    });
  }

  const client = apiClient(auth0AccessToken);

  return client.post('/sessions/start', {});
};
