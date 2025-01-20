import { BiChevronRight } from 'react-icons/bi';
import { useGetAllImages } from '../../../../hooks/useGetAllImages';
import Loader from '../../../../components/Loader';
import { getProfilePhotoUrl } from '../../../../utils/getProfilePhoto';
import Avatar from 'react-avatar';
import { useGetIsMessageRead, useMarkMessagesAsRead } from '../../hooks';
import { useLocalStorage } from '@uidotdev/usehooks';

interface IMessage {
  message: string;
  fromUserId: number;
  chatId: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface IUserChatProps {
  user: {
    avatar: string;
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  onClick: () => void;
  lastMessage: IMessage | null;
}

const UserChat = ({ user, onClick, lastMessage }: IUserChatProps) => {
  const { allImages, allImagesLoading } = useGetAllImages(user.id);
  const [userId] = useLocalStorage('userId');
  const { onMarkMessagesAsRead } = useMarkMessagesAsRead();
  const { isMessageReadData } = useGetIsMessageRead(String(lastMessage?.id || ''));
  const { is_read } = isMessageReadData?.data || {};

  if (allImagesLoading) return <Loader />;

  const isMarkedAsRead = () => {
    if (!lastMessage) return true;
    if (lastMessage?.fromUserId === Number(userId)) return true;

    return is_read;
  };

  return (
    <div
      className={`flex rounded items-center justify-between p-4 border-b border-gray-200 cursor-pointer mb-4 mt-2 ${isMarkedAsRead() ? 'bg-white text-black' : 'bg-blue text-white'}`}
      onClick={() => {
        if (lastMessage?.fromUserId !== Number(userId)) {
          onMarkMessagesAsRead(lastMessage?.id || '');
        }
        onClick();
      }}
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
          <p className="text-gray-500">{lastMessage?.message}</p>
        </div>
      </div>
      <BiChevronRight className="w-6 h-6 text-gray-500" color={is_read ? '#000' : '#fff'} />
    </div>
  );
};

export default UserChat;
