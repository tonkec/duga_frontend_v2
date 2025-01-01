import { apiClient } from '..';

interface IVerifyOnSignupProps {
  email: string;
  token: string;
}

export const verifyOnSignupToken = async ({ email, token }: IVerifyOnSignupProps) => {
  const client = apiClient({ isAuth: true });
  return client.get(`/verification/`, {
    params: {
      email,
      token,
    },
  });
};
