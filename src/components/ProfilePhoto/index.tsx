import Avatar from 'react-avatar';
import { Link } from 'react-router';
import { IUser } from '../UserCard';

interface IProfilePhotoProps {
  url: string;
  currentUser: IUser;
}

const ProfilePhoto = ({ url, currentUser }: IProfilePhotoProps) => {
  return (
    <Link to={'/profile'}>
      <Avatar
        color="#F037A5"
        src={url}
        size="40"
        round={true}
        name={`${currentUser.firstName} ${currentUser.lastName}`}
      />
    </Link>
  );
};

export default ProfilePhoto;
