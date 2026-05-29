import Card from '@app/components/Card';
import { BiSolidMap, BiStopwatch } from 'react-icons/bi';
import clsx from 'clsx';
import { useSocket } from '@app/context/useSocket';
import { useEffect, useState } from 'react';
import UserAvatar from '../UserAvatar';
import Button from '../Button';
import type { IImage } from '../Photos';
export interface IUser {
  avatar: string;
  picture?: string | null;
  profilePhoto?: {
    securePhotoUrl?: string | null;
    imageUrl?: string | null;
    url?: string | null;
  } | null;
  securePhotoUrl?: string | null;
  imageUrl?: string | null;
  url?: string | null;
  email: string;
  lastName: string;
  firstName: string;
  bio: string;
  gender: string;
  id: number;
  publicId?: string;
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
      <p className="user-card-meta flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
        <BiSolidMap className="user-card-meta-icon text-blue" /> Lokacija nije unesena
      </p>
    );
  }

  return (
    <p className="user-card-meta flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
      <BiSolidMap className="user-card-meta-icon text-blue" /> {location}
    </p>
  );
};

const getUserAge = ({ age }: { age: number }) => {
  if (!age) {
    return (
      <p className="user-card-meta flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
        <BiStopwatch className="user-card-meta-icon text-blue" />
        Godine nisu unesene
      </p>
    );
  }

  return (
    <p className="user-card-meta flex items-center gap-1.5 rounded-full bg-[#f7f9ff] px-3 py-1.5 text-gray-600">
      <BiStopwatch className="user-card-meta-icon text-blue" /> {age} godina
    </p>
  );
};

const getUserProfilePhoto = (user: IUser): Partial<IImage> | undefined => {
  const imageSource =
    user.profilePhoto?.securePhotoUrl ||
    user.profilePhoto?.imageUrl ||
    user.profilePhoto?.url ||
    user.securePhotoUrl ||
    user.imageUrl ||
    user.avatar ||
    user.picture ||
    '';

  if (!imageSource) return undefined;

  return {
    securePhotoUrl: imageSource,
    imageUrl: imageSource,
    url: imageSource,
  };
};

const UserCard = ({ user, onButtonClick, isOnline }: IUserCardProps) => {
  const socket = useSocket();
  const [isOnlineState, setIsOnlineState] = useState(isOnline);
  const profilePhoto = getUserProfilePhoto(user);

  useEffect(() => {
    if (!socket || !user.id) return;

    const handleStatusUpdate = (data: { userId: number; status: 'online' | 'offline' }) => {
      if (Number(data.userId) === Number(user.id)) {
        setIsOnlineState(data.status === 'online');
      }
    };

    socket.on('status-update', handleStatusUpdate);

    return () => {
      socket.off('status-update', handleStatusUpdate);
    };
  }, [socket, user.id]);

  useEffect(() => {
    setIsOnlineState(isOnline);
  }, [isOnline]);

  return (
    <Card
      className="user-card group flex h-full flex-col rounded-3xl !bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      onClick={onButtonClick}
    >
      <div className="user-card-avatar-wrap relative w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#f7f9ff] to-[#eef3ff]">
        <UserAvatar
          avatarFallbackName={`${user.username}`}
          color="#f7f9ff"
          userId={String(user.id)}
          className="aspect-[16/10] w-full transition-transform duration-300 group-hover:scale-105"
          fgColor="#1f2937"
          profilePhoto={profilePhoto}
        />
        <span
          className={clsx(
            'absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur',
            isOnlineState
              ? 'user-card-status-online bg-green text-white'
              : 'user-card-status-offline border border-[#dce4ff] bg-white/95 text-gray-600'
          )}
        >
          {isOnlineState ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-5 text-center">
        <div className="flex flex-1 flex-col">
          <h3 className="min-w-0 truncate text-2xl font-bold tracking-tight text-gray-950">
            {user.username}
          </h3>
          <div className="mx-auto mt-4 flex w-full max-w-[13rem] flex-col items-stretch gap-2 text-sm">
            {getUserLocation(user)}
            {getUserAge(user)}
          </div>

          <Button
            className="user-card-button mt-5 w-full rounded-full px-5 py-3 font-semibold shadow-md shadow-blue/15"
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
