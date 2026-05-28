import { apiClient } from '.';
import { setAppCsrfToken } from './appSession';
import { resolveAuth0AccessToken } from './authToken';

type StartSessionResponse = {
  csrfToken?: unknown;
};

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

  const response = await client.post<StartSessionResponse>('/sessions/start', {});
  if (typeof response.data.csrfToken === 'string' && response.data.csrfToken) {
    setAppCsrfToken(response.data.csrfToken);
  }

  return response;
};
