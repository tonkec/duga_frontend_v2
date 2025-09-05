import Loader from '@app/components/Loader';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { Navigate, Outlet } from 'react-router';

const PostLoginGuard = () => {
  const { user, isUserLoading } = useGetCurrentUser();

  if (isUserLoading) {
    return <Loader />;
  }

  if (!user?.data?.onboarding_done) {
    return <Navigate to="/post-login" />;
  }

  return <Outlet />;
};

export default PostLoginGuard;
