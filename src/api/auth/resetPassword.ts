import { apiClient } from '..';

export const resetPassword = async (password: string, email: string) => {
  const client = apiClient({ isAuth: true });
  return client.post(`/reset-password/`, { password, email });
};
