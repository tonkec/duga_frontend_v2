import { truncateString } from '../../utils/truncateString';
import Button from '../Button';
import Avatar from 'react-avatar';
export interface User {
  avatar: string;
  email: string;
  lastName: string;
  firstName: string;
  bio: string;
  gender: string;
  id: string;
  isVerified: boolean;
  location: string;
  password: string;
  sexuality: string;
  updatedAt: string;
  username: string;
}

interface IUserCardProps {
  user: User;
}

const getUserBio = (bio: string) => {
  if (!bio) {
    return 'Biografije još nije postavljena.';
  }

  return truncateString(bio, 100);
};

const UserCard = ({ user }: IUserCardProps) => {
  return (
    <div className=" bg-white rounded-lg shadow-sm p-6 flex space-x-4">
      <Avatar
        name={`${user.firstName} ${user.lastName}`}
        src={user.avatar}
        size="100"
        round
        color="#2D46B9"
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          {user.firstName} {user.lastName}
        </h3>
        {user.location && <p className="text-gray-600">{user.location}</p>}
        <p className="text-gray-600 mt-2">{getUserBio(user.bio)}</p>
        <Button onClick={() => {}} type="primary" className="mt-4">
          Pogledaj profil
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
