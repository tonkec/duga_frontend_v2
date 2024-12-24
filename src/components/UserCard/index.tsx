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
    return 'Biografija još nije postavljena.';
  }

  return truncateString(bio, 100);
};

const getUserLocation = ({ location }: { location: string }) => {
  if (!location) {
    return <p className="text-gray-600">Lokacija: Nepoznato</p>;
  }
  return <p className="text-gray-600">Lokacija: {location}</p>;
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
      <div className="flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {user.firstName} {user.lastName}
          </h3>
          {getUserLocation(user)}
          <p className="text-gray-600 mt-2">{getUserBio(user.bio)}</p>
        </div>
        <Button onClick={() => {}} type="primary" className="mt-4 max-w-[150px]">
          Pogledaj profil
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
