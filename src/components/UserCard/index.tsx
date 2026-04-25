import Card from '@app/components/Card';
import { BiSolidMap, BiStopwatch } from 'react-icons/bi';
import clsx from 'clsx';
import { useSocket } from '@app/context/useSocket';
import { useEffect, useState } from 'react';
import UserAvatar from '../UserAvatar';
import Button from '../Button';
export interface IUser {
  avatar: string;
  email: string;
  lastName: string;
  firstName: string;
  bio: string;
  gender: string;
  id: number;
  isVerified: boolean;
  location: string;
  password: string;
  sexuality: string;
  updatedAt: string;
  username: string;
  age: number;
  status: 'online' | 'offline';
}

interface IUserCardProps {
  user: IUser;
  onButtonClick: () => void;
  isOnline?: boolean;
}

const getUserLocation = ({ location }: { location: string }) => {
  if (!location) {
    return (
      <p className="text-gray-600 gap-1 flex items-center justify-center mb-1">
        {' '}
        <BiSolidMap /> Lokacija: n/a
      </p>
    );
  }

  return (
    <p className="text-gray-600 gap-1 flex items-center justify-center mb-1">
      {' '}
      <BiSolidMap /> Lokacija: {location}
    </p>
  );
};

const getUserAge = ({ age }: { age: number }) => {
  if (!age) {
    return (
      <p className="text-gray-600 gap-1 flex items-center justify-center mb-1">
        {' '}
        <BiStopwatch />
        Godine: n/a
      </p>
    );
  }

  return (
    <p className="text-gray-600 gap-1 flex items-center justify-center mb-1">
      <BiStopwatch /> Godine: {age}
    </p>
  );
};

const UserCard = ({ user, onButtonClick, isOnline }: IUserCardProps) => {
  const socket = useSocket();
  const [isOnlineState, setIsOnlineState] = useState(isOnline);

  useEffect(() => {
    if (!socket || !user.id) return;

    socket.on('status-update', (data: { userId: number; status: 'online' | 'offline' }) => {
      if (Number(data.userId) === Number(user.id)) {
        setIsOnlineState(data.status === 'online');
      }
    });

    return () => {
      socket.off('status-update');
    };
  }, [socket, user.id]);

  useEffect(() => {
    setIsOnlineState(isOnline);
  }, [isOnline]);

  return (
    <Card
      className="h-full flex flex-col justify-between pb-8 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onButtonClick}
    >
      <div className="w-full mb-4 overflow-hidden">
        <UserAvatar
          avatarFallbackName={`${user.username}`}
          color="#f7f9ff"
          userId={String(user.id)}
          className="aspect-square w-full"
        />
      </div>
      <div className="flex flex-col justify-between text-center mt-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
            {user.username}
            <span
              className={clsx(
                'inline-block w-2 h-2 rounded-full',
                isOnlineState ? 'bg-green' : 'bg-gray-400'
              )}
            />
          </h3>
          {getUserLocation(user)}
          {getUserAge(user)}

          <Button className="mt-4" onClick={onButtonClick} type="blue">
            Pogledaj profil
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
