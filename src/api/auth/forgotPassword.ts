import { apiClient } from '..';

export const forgotPassword = async (email: string) => {
  const client = apiClient({ isAuth: true });
  return client.post(`/forgot-password/`, { email });
};
