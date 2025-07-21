import Avatar from 'react-avatar';
import { useGetProfilePhoto } from './hooks/useGetProfilePhoto';

interface IUserAvatarProps {
  avatarFallbackName: string;
  color: string;
  onClick?: () => void;
  userId: string;
  size?: string;
  round?: boolean;
}

const UserAvatar = ({
  avatarFallbackName,
  color,
  onClick,
  userId,
  size = '40',
  round = true,
}: IUserAvatarProps) => {
  const { profilePhoto } = useGetProfilePhoto(userId);
  if (profilePhoto) {
    return (
      <Avatar
        color={color}
        name={avatarFallbackName}
        src={profilePhoto.data.securePhotoUrl}
        size={size}
        round={round}
        onClick={onClick}
        className="cursor-pointer"
        textSizeRatio={2}
      />
    );
  }
};

export default UserAvatar;
