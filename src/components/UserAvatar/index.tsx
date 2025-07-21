import Avatar from 'react-avatar';
import { useGetProfilePhoto } from './hooks/useGetProfilePhoto';

interface IUserAvatarProps {
  avatarFallbackName: string;
  color: string;
  onClick?: () => void;
  userId: string;
}

const UserAvatar = ({ avatarFallbackName, color, onClick, userId }: IUserAvatarProps) => {
  const { profilePhoto } = useGetProfilePhoto(userId);
  if (profilePhoto) {
    return (
      <Avatar
        color={color}
        name={avatarFallbackName}
        src={profilePhoto.data.securePhotoUrl}
        size="20"
        round={true}
        onClick={onClick}
        className="cursor-pointer"
      />
    );
  }
};

export default UserAvatar;
