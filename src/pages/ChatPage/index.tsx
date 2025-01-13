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
import { useSocket } from '../../context/useSocket';
import ConfirmModal from '../../components/ConfirmModal';

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

interface ITypingData {
  userId: number;
}

const getOtherUser = (chatUsers: IChatUser[], currentUserId: string) => {
  return chatUsers.find((user) => user.userId !== Number(currentUserId));
};

interface IDeleteChatModalProps {
  setIsDeleteModalVisible: (value: boolean) => void;
  onDeleteChat: () => void;
  isDeleteModalVisible: boolean;
}

const DeleteChatModal = ({
  setIsDeleteModalVisible,
  onDeleteChat,
  isDeleteModalVisible,
}: IDeleteChatModalProps) => {
  return (
    <ConfirmModal
      isOpen={isDeleteModalVisible}
      onConfirm={onDeleteChat}
      onClose={() => setIsDeleteModalVisible(false)}
    >
      <h2 className="text-xl text-center"> Jesi li siguran_na da želiš obrisati razgovor?</h2>
      <p className="text-center">Brisanje razgovora briše razgovor i za drugu osobu</p>
    </ConfirmModal>
  );
};

const ChatPage = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
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
    socket.on('typing', (data: ITypingData) => {
      if (data.userId === Number(otherUserId)) {
        setIsTyping(true);
      }
    });

    return () => {
      socket.off('typing');
    };
  }, [socket, otherUserId]);

  return (
    <ChatGuard>
      <AppLayout>
        <DeleteChatModal
          isDeleteModalVisible={isDeleteModalVisible}
          setIsDeleteModalVisible={setIsDeleteModalVisible}
          onDeleteChat={() => {
            if (!chatId) return;
            deleteChat({ chatId });
            navigate('/chats');
          }}
        />
        <Button
          className="mb-2"
          type="danger"
          onClick={(e) => {
            e?.preventDefault();
            setIsDeleteModalVisible(true);
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
          {isTyping && <p className="text-sm text-gray-500 mb-0">Tipka...</p>}
          <SendMessage otherUserId={otherUserId} chatId={chatId} />
        </Card>
      </AppLayout>
    </ChatGuard>
  );
};

export default ChatPage;
