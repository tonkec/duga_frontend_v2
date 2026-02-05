import { Link } from 'react-router';
import { IUser } from '@app/components/UserCard';
import UserAvatar from '../UserAvatar';

interface IProfilePhotoProps {
  currentUser: IUser;
}

const ProfilePhoto = ({ currentUser }: IProfilePhotoProps) => {
  return (
    <Link to={'/profile'}>
      <UserAvatar
        userId={String(currentUser.id)}
        color="#F037A5"
        avatarFallbackName={`${currentUser?.username}`}
        className="rounded-sm w-12 h-12"
      />
    </Link>
  );
};

export default ProfilePhoto;
