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
      <p className="text-gray-600 gap-1.5 flex items-center justify-center">
        <BiSolidMap className="text-blue" /> Lokacija nije unesena
      </p>
    );
  }

  return (
    <p className="text-gray-600 gap-1.5 flex items-center justify-center">
      <BiSolidMap className="text-blue" /> {location}
    </p>
  );
};

const getUserAge = ({ age }: { age: number }) => {
  if (!age) {
    return (
      <p className="text-gray-600 gap-1.5 flex items-center justify-center">
        <BiStopwatch className="text-blue" />
        Godine nisu unesene
      </p>
    );
  }

  return (
    <p className="text-gray-600 gap-1.5 flex items-center justify-center">
      <BiStopwatch className="text-blue" /> {age} godina
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
      className="group h-full rounded-2xl p-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onButtonClick}
    >
      <div className="relative w-full overflow-hidden rounded-xl bg-[#f7f9ff]">
        <UserAvatar
          avatarFallbackName={`${user.username}`}
          color="#f7f9ff"
          userId={String(user.id)}
          className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
          fgColor="#1f2937"
        />
        <span
          className={clsx(
            'absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur',
            isOnlineState ? 'bg-green text-white' : 'bg-white/90 text-gray-600'
          )}
        >
          {isOnlineState ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="flex flex-col justify-between text-center px-2 py-4">
        <div className="min-h-[116px]">
          <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
          <div className="mt-3 space-y-1.5 text-sm">
            {getUserLocation(user)}
            {getUserAge(user)}
          </div>

          <Button className="mt-5 w-full" onClick={onButtonClick} type="blue">
            Pogledaj profil
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
