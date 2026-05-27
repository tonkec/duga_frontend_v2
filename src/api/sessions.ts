import { apiClient } from '.';
import { getAppSessionId, setAppSessionId, SESSION_HEADER } from './appSession';
import { resolveAuth0AccessToken, setDugaApiToken } from './authToken';

type SessionStartResponse = {
  sessionId?: string;
  token?: string;
  data?: {
    sessionId?: string;
    token?: string;
  };
};

const getSessionToken = (data: SessionStartResponse) => data.token ?? data.data?.token;
const getSessionId = (data: SessionStartResponse) => data.sessionId ?? data.data?.sessionId;

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

  const headers: Record<string, string> = {
    Authorization: `Bearer ${auth0AccessToken}`,
  };
  if (sessionId) {
    headers[SESSION_HEADER] = sessionId;
  }

  const response = await client.post<SessionStartResponse>(
    '/sessions/start',
    sessionId ? { sessionId } : {},
    {
      headers,
    }
  );

  const token = getSessionToken(response.data);
  const nextSessionId = getSessionId(response.data);
  if (nextSessionId) {
    setAppSessionId(nextSessionId);
  }

  if (token) {
    setDugaApiToken(token);
  }

  return response;
};
