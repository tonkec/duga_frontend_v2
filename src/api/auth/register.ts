import { apiClient } from '..';

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  const client = apiClient({ isAuth: true });
  return client.post(`/register`, { email, password, firstName, lastName });
};
