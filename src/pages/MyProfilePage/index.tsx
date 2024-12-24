import { useLocalStorage } from '@uidotdev/usehooks';
import AppLayout from '../../components/AppLayout';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../../components/Card';
import Avatar from 'react-avatar';

const MyProfilePage = () => {
  const [userId] = useLocalStorage('userId');
  const { user: currentUser, isUserLoading } = useGetUserById(userId as string);

  if (isUserLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <Card>
          <div>
            <Avatar
              name={`${currentUser?.data.firstName} ${currentUser?.data.lastName}`}
              src={currentUser?.data.avatar}
              size="100"
              round
              color="#2D46B9"
            />
          </div>
          <div>
            <h1>
              {currentUser?.data.firstName} {currentUser?.data.lastName}
            </h1>
            <p>{currentUser?.data.email}</p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MyProfilePage;
