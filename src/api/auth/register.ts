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
  const client = apiClient(auth0AccessToken ?? undefined);
  return client.post(`/register`, { email, username, isVerified, auth0Id });
};
