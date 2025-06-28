import { apiClient } from '..';

export const register = async (
  auth0Id: string,
  email: string,
  username: string,
  isVerified: boolean
) => {
  const client = apiClient(true);
  return client.post(`/register`, { email, username, isVerified, auth0Id });
};
