import { Navigate, Outlet } from 'react-router';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import Loader from '@app/components/Loader';

const PostLoginFormGuard = () => {
  const { user, isUserLoading } = useGetCurrentUser();

  if (isUserLoading) {
    return <Loader />;
  }

  if (user?.data?.onboarding_done) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PostLoginFormGuard;
