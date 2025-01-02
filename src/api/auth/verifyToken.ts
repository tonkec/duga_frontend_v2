import { apiClient } from '..';

export const verifyToken = async (token: string, email: string) => {
  const client = apiClient(true);
  return client.post(`/verification-token/`, { token, email });
};
