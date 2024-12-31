import { apiClient } from '..';

export const verifyToken = async (token: string, email: string) => {
  const client = apiClient({ isAuth: true });
  return client.post(`/verification-token/`, { token, email });
};
