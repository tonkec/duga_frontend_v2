import { useNavigate, useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import SendMessage from './components/SendMessage';
import { useEffect, useMemo, useState } from 'react';
import { socket } from '../../socket';
import { useLocalStorage } from '@uidotdev/usehooks';
import ChatGuard from './components/ChatGuard';
import PaginatedMessages from './components/PaginatedMessages';
import { useGetCurrentChat } from './hooks';
import { useGetUserById } from '../../hooks/useGetUserById';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';

interface IMessage {
  id: string;
  message: string;
  createdAt: string;
  User: {
    id: number;
  };
}

interface IChatUser {
  userId: number;
}

const getOtherUser = (chatUsers: IChatUser[], currentUserId: string) => {
  return chatUsers.find((user) => user.userId !== Number(currentUserId));
};

const ChatPage = () => {
  const navigate = useNavigate();
  const [currentUserId] = useLocalStorage('userId');
  const { chatId } = useParams();
  const [receivedMessages, setReceivedMessages] = useState<IMessage[]>([]);
  const { currentChat, isCurrentChatLoading } = useGetCurrentChat(chatId as string);

  const otherUserId = useMemo(() => {
    if (!currentChat || isCurrentChatLoading) return null;
    return getOtherUser(currentChat.data, currentUserId as string)?.userId;
  }, [currentChat, currentUserId, isCurrentChatLoading]);

  const { allImages: allOtherUserImages } = useGetAllImages(String(otherUserId || ''));
  const { allImages: allCurrentUserImages } = useGetAllImages(currentUserId as string);
  const otherUserProfilePhoto = getProfilePhotoUrl(
    getProfilePhoto(allOtherUserImages?.data.images)
  );
  const currentUserProfilePhoto = getProfilePhotoUrl(
    getProfilePhoto(allCurrentUserImages?.data.images)
  );
  const { user: otherUser } = useGetUserById(String(otherUserId || ''));
  const { user: currentUser } = useGetUserById(currentUserId as string);

  const otherUserName = useMemo(() => {
    if (!otherUser) return '';
    return `${otherUser.data.firstName} ${otherUser.data.lastName}`;
  }, [otherUser]);

  const currentUserName = useMemo(() => {
    if (!currentUser) return '';
    return `${currentUser.data.firstName} ${currentUser.data.lastName}`;
  }, [currentUser]);

  useEffect(() => {
    socket.on('received', (data: IMessage) => {
      setReceivedMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('received');
    };
  }, []);

  return (
    <ChatGuard>
      <AppLayout>
        <Card>
          <h1 className="underline cursor-pointer" onClick={() => navigate(`/user/${otherUserId}`)}>
            {otherUserName}
          </h1>
          <div className="mt-4">
            <PaginatedMessages
              currentUserName={currentUserName}
              otherUserName={otherUserName}
              currentUserProfilePhoto={currentUserProfilePhoto}
              otherUserProfilePhoto={otherUserProfilePhoto}
              otherUserId={otherUserId as number}
              receivedMessages={receivedMessages}
            />
          </div>
          <SendMessage chatId={chatId} />
        </Card>
      </AppLayout>
    </ChatGuard>
  );
};

export default ChatPage;
