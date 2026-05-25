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
      <p className="flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
        <BiSolidMap className="text-blue" /> Lokacija nije unesena
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
      <BiSolidMap className="text-blue" /> {location}
    </p>
  );
};

const getUserAge = ({ age }: { age: number }) => {
  if (!age) {
    return (
      <p className="flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
        <BiStopwatch className="text-blue" />
        Godine nisu unesene
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
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
      className="group h-full rounded-3xl !bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      onClick={onButtonClick}
    >
      <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#f7f9ff] to-[#eef3ff]">
        <UserAvatar
          avatarFallbackName={`${user.username}`}
          color="#eef3ff"
          userId={String(user.id)}
          className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
          fgColor="#1f2937"
        />
        <span
          className={clsx(
            'absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur',
            isOnlineState
              ? 'bg-green text-white'
              : 'border border-[#dce4ff] bg-white/95 text-gray-600'
          )}
        >
          {isOnlineState ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-5 text-center">
        <div className="flex flex-1 flex-col">
          <h3 className="truncate text-2xl font-bold tracking-tight text-gray-950">
            {user.username}
          </h3>
          <div className="mx-auto mt-4 flex flex-col items-center gap-2 text-sm">
            {getUserLocation(user)}
            {getUserAge(user)}
          </div>

          <Button
            className="mt-5 w-full rounded-full py-3 font-semibold shadow-md shadow-blue/15"
            onClick={onButtonClick}
            type="blue"
          >
            Pogledaj profil
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
