import Button from '../Button';
import Avatar from 'react-avatar';
import Card from '../Card';
import { getUserBio } from '../UserProfileCard/utils';
import { useNavigate } from 'react-router';
export interface IUser {
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
  user: IUser;
}

const getUserLocation = ({ location }: { location: string }) => {
  if (!location) {
    return <p className="text-gray-600">Lokacija: Nepoznato</p>;
  }

  return <p className="text-gray-600">Lokacija: {location}</p>;
};

const UserCard = ({ user }: IUserCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="space-x-4">
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
        <Button
          onClick={() => navigate(`/user/${user.id}`)}
          type="primary"
          className="mt-4 max-w-[150px]"
        >
          Pogledaj profil
        </Button>
      </div>
    </Card>
  );
};

export default UserCard;
