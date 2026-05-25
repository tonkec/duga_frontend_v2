import { apiClient } from '..';
import { setAppSessionId } from '../appSession';
import { resolveAuth0AccessToken } from '../authToken';

type RegisterResponse = {
  sessionId?: string;
  data?: {
    sessionId?: string;
  };
};

const getRegisteredSessionId = (data: RegisterResponse) => data.sessionId ?? data.data?.sessionId;

export const register = async (
  auth0Id: string,
  email: string,
  username: string,
  isVerified: boolean,
  token?: string | null
) => {
  const auth0AccessToken = token ?? (await resolveAuth0AccessToken());
  const client = apiClient(auth0AccessToken ?? undefined);
  const response = await client.post<RegisterResponse>(`/register`, {
    email,
    username,
    isVerified,
    auth0Id,
  });
  const sessionId = getRegisteredSessionId(response.data);

  if (sessionId) {
    setAppSessionId(sessionId);
  }

  return response;
};
