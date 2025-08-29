import { Navigate } from 'react-router';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import Loader from '@app/components/Loader';

const PostLoginFormGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading } = useGetCurrentUser();

  if (isUserLoading) {
    return <Loader />;
  }

  if (user?.data?.onboarding_done) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PostLoginFormGuard;
