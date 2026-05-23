import { apiClient } from '.';
import { getAppSessionId, SESSION_HEADER } from './appSession';
import { resolveAuth0AccessToken, setDugaApiToken } from './authToken';

type SessionStartResponse = {
  token?: string;
  data?: {
    token?: string;
  };
};

const getSessionToken = (data: SessionStartResponse) => data.token ?? data.data?.token;

export const startSession = async () => {
  const sessionId = getAppSessionId();
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

  const response = await client.post<SessionStartResponse>(
    '/sessions/start',
    { sessionId },
    {
      headers: {
        Authorization: `Bearer ${auth0AccessToken}`,
        [SESSION_HEADER]: sessionId,
      },
    }
  );

  const token = getSessionToken(response.data);
  if (token) {
    setDugaApiToken(token);
  }

  return response;
};
