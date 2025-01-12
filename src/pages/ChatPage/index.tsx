import { useNavigate, useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import SendMessage from './components/SendMessage';
import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import ChatGuard from './components/ChatGuard';
import PaginatedMessages from './components/PaginatedMessages';
import { useDeleteCurrentChat, useGetCurrentChat } from './hooks';
import { useGetUserById } from '../../hooks/useGetUserById';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';
import Button from '../../components/Button';
import { useSocket } from '../../context/socket';

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
  const socket = useSocket();

  const navigate = useNavigate();
  const [currentUserId] = useLocalStorage('userId');
  const { chatId } = useParams();
  const { deleteChat } = useDeleteCurrentChat();
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
  }, [socket]);

  useEffect(() => {
    socket.on('typing', (data: IMessage) => {
      console.log(data);
    });

    return () => {
      socket.off('typing');
    };
  }, [socket]);

  return (
    <ChatGuard>
      <AppLayout>
        <Button
          className="mb-2"
          type="danger"
          onClick={() => {
            deleteChat({ chatId: chatId as string });
          }}
        >
          Izbriši razgovor
        </Button>
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
          <SendMessage otherUserId={otherUserId} chatId={chatId} />
        </Card>
      </AppLayout>
    </ChatGuard>
  );
};

export default ChatPage;
