import Button from '../Button';
import Avatar from 'react-avatar';
import Card from '../Card';
import { getUserBio } from '../UserProfileCard/utils';
import { BiSolidMap, BiStopwatch } from 'react-icons/bi';
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
  age: number;
}

interface IUserCardProps {
  user: IUser;
  onButtonClick: () => void;
  buttonText: string;
  secondButton?: boolean;
  secondButtonText?: string;
  onSecondButtonClick?: () => void;
}

const getUserLocation = ({ location }: { location: string }) => {
  if (!location) {
    return (
      <p className="text-gray-600 gap-1 flex items-center justify-center mb-2">
        {' '}
        <BiSolidMap /> Lokacija: n/a
      </p>
    );
  }

  return (
    <p className="text-gray-600 gap-1 flex items-center justify-center mb-2">
      {' '}
      <BiSolidMap /> Lokacija: {location}
    </p>
  );
};

const getUserAge = ({ age }: { age: number }) => {
  if (!age) {
    return (
      <p className="text-gray-600 gap-1 flex items-center justify-center">
        {' '}
        <BiStopwatch />
        Godine: n/a
      </p>
    );
  }

  return (
    <p className="text-gray-600 gap-1 flex items-center justify-center">
      <BiStopwatch /> Godine: {age}
    </p>
  );
};

const UserCard = ({
  user,
  onButtonClick,
  buttonText,
  secondButton,
  secondButtonText,
  onSecondButtonClick,
}: IUserCardProps) => {
  return (
    <Card>
      <div className="w-full text-center">
        <Avatar
          name={`${user.firstName} ${user.lastName}`}
          src={user.avatar}
          size="100"
          textSizeRatio={3}
          color="#2D46B9"
          className="w-full mb-4 "
          round
        />
      </div>
      <div className="flex flex-col justify-between text-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {user.firstName} {user.lastName}
          </h3>
          {getUserLocation(user)}
          {getUserAge(user)}
          <p className="text-gray-600 mt-2 flex items-center justify-center gap-1">
            {' '}
            <span>{getUserBio(user.bio)}</span>
          </p>
        </div>
        <div className="flex gap-2 justify-center items-center mt-4 flex-col">
          <Button onClick={onButtonClick} type="primary">
            {buttonText}
          </Button>
          {secondButton && (
            <Button onClick={onSecondButtonClick} type="blue">
              {secondButtonText}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
