import { apiClient } from '..';

export const forgotPassword = async (email: string) => {
  const client = apiClient(true);
  return client.post(`/forgot-password/`, { email });
};
