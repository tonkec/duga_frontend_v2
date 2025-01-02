import { apiClient } from '..';

export const login = async (email: string, password: string) => {
  const client = apiClient(true);
  return client.post(`/login/`, { email, password });
};
