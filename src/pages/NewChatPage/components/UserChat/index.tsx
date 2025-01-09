import { BiChevronRight } from 'react-icons/bi';
import { useGetAllImages } from '../../../../hooks/useGetAllImages';
import Loader from '../../../../components/Loader';
import { getProfilePhotoUrl } from '../../../../utils/getProfilePhoto';
import Avatar from 'react-avatar';

interface IUserChatProps {
  user: {
    avatar: string;
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  onClick: () => void;
  lastMessage: string;
}

const UserChat = ({ user, onClick, lastMessage }: IUserChatProps) => {
  const { allImages, allImagesLoading } = useGetAllImages(user.id);

  if (allImagesLoading) return <Loader />;

  return (
    <div
      className="flex items-center justify-between p-4 border-b border-gray-200 bg-white cursor-pointer mb-4 mt-2"
      onClick={onClick}
    >
      <div className="flex items-center">
        <Avatar
          color="#2D46B9"
          name={`${user.firstName} ${user.lastName}`}
          src={getProfilePhotoUrl(allImages?.data.images)}
          size="40"
          round={true}
        />
        <div className="ml-4">
          <h1 className="text-lg font-semibold">
            {user.firstName} {user.lastName}
          </h1>
        </div>

        <div className="ml-4">
          <p className="text-gray-500">{lastMessage}</p>
        </div>
      </div>
      <BiChevronRight className="w-6 h-6 text-gray-500" />
    </div>
  );
};

export default UserChat;
