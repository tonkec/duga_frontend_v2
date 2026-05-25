import { useNavigate, useParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import Card from '@app/components/Card';
import SendMessage from './components/SendMessage';
import { useEffect, useRef, useState } from 'react';
import ChatGuard from './components/ChatGuard';
import PaginatedMessages from './components/PaginatedMessages';
import { useDeleteCurrentChat, useGetCurrentChat } from './hooks';
import { getOtherUser } from './utils/getOtherUser';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Button from '@app/components/Button';
import UserAvatar from '@app/components/UserAvatar';
import { useSocket } from '@app/context/useSocket';
import ConfirmModal from '@app/components/ConfirmModal';
import { IMessage } from './components/Message';
import ChatBubble from '@app/components/ChatBubble';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';

interface ITypingData {
  userId: number;
}

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
  const deletedBySelfRef = useRef(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const { user: currentUser, isUserLoading: isCurrentUserLoading } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const { chatId } = useParams();
  const [receivedMessages, setReceivedMessages] = useState<IMessage[]>([]);
  const { currentChat, isCurrentChatLoading, isCurrentChatError } = useGetCurrentChat(
    chatId as string
  );
  const otherUserId = getOtherUser(currentChat?.data, currentUserId as string)?.userId;
  const { deleteChat } = useDeleteCurrentChat(socket);

  const { user: otherUser } = useGetUserById(String(otherUserId || ''));
  const otherUserName = otherUser?.data.username;
  const currentUserName = currentUser?.data.username;

  const [isOnlineState, setIsOnlineState] = useState<boolean>(otherUser?.data?.status === 'online');

  useEffect(() => {
    if (!socket) return;

    socket.on('received', (data: IMessage) => {
      setReceivedMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('received');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('typing', (data: ITypingData) => {
      if (data.userId === Number(otherUserId)) {
        setIsTyping(true);
      }
    });

    socket.on('stop-typing', (data: ITypingData) => {
      if (data.userId === Number(otherUserId)) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('typing');
      socket.off('stop-typing');
      setIsTyping(false);
    };
  }, [socket, otherUserId]);

  useEffect(() => {
    if (!socket || !otherUserId) return;

    socket.on('status-update', (data) => {
      if (Number(data.userId) === Number(otherUserId)) {
        setIsOnlineState(data.status === 'online');
        return;
      }

      setIsOnlineState(otherUser?.data.status === 'online');
    });

    return () => {
      socket.off('status-update');
    };
  }, [socket, otherUserId, otherUser]);

  useEffect(() => {
    if (otherUser?.data?.status) {
      setIsOnlineState(otherUser.data.status === 'online');
    }
  }, [otherUser?.data?.status]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chatDeleted', ({ chatId: deletedChatId }) => {
      if (String(deletedChatId) !== String(chatId)) return;
      if (!deletedBySelfRef.current) {
        toast.info('Razgovor je obrisan.', toastConfig);
      }
      navigate('/new-chat', { replace: true });
    });

    return () => {
      socket.off('chatDeleted');
    };
  }, [chatId, navigate, socket]);

  useEffect(() => {
    if (!chatId || isCurrentChatLoading) return;
    if (!currentChat?.data || isCurrentChatError) {
      navigate('/new-chat', { replace: true });
    }
  }, [chatId, currentChat?.data, isCurrentChatError, isCurrentChatLoading, navigate]);

  if (isCurrentChatLoading || !currentChat?.data || isCurrentChatError) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  return (
    <ChatGuard>
      <AppLayout>
        <DeleteChatModal
          isDeleteModalVisible={isDeleteModalVisible}
          setIsDeleteModalVisible={setIsDeleteModalVisible}
          onDeleteChat={() => {
            if (!chatId) return;
            deletedBySelfRef.current = true;
            deleteChat({ chatId });
            setIsDeleteModalVisible(false);
          }}
        />
        <Card className="!overflow-hidden !rounded-xl !border-[#dce4ff] !bg-white !p-0 !shadow-md">
          <header className="flex items-center justify-between gap-3 border-b border-[#e8eeff] px-4 py-3">
            <button
              type="button"
              className="flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-80"
              onClick={() => navigate(`/user/${otherUserId}`)}
            >
              <UserAvatar
                color="#2D46B9"
                avatarFallbackName={otherUserName ?? ''}
                userId={String(otherUserId ?? '')}
                className="h-11 w-11 shrink-0 rounded-full"
              />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-gray-900">{otherUserName}</h1>
                <p className="text-xs text-gray-500">{isOnlineState ? 'Na mreži' : 'Offline'}</p>
              </div>
            </button>
            <Button
              type="danger"
              className="shrink-0 !py-1.5 !px-3 !text-xs"
              onClick={(e) => {
                e?.preventDefault();
                setIsDeleteModalVisible(true);
              }}
            >
              Izbriši
            </Button>
          </header>

          <div className="flex min-h-[360px] flex-col bg-[#f7f9ff]">
            <PaginatedMessages
              currentUserName={currentUserName}
              otherUserName={otherUserName}
              otherUserId={otherUserId as number}
              receivedMessages={receivedMessages}
              currentUserId={currentUserId as number}
              isCurrentUserLoading={isCurrentUserLoading}
            />
            {isTyping && (
              <div className="px-4 pb-2">
                <ChatBubble />
              </div>
            )}
          </div>

          {chatId && (
            <div className="border-t border-[#e8eeff] bg-white px-4 py-3">
              <SendMessage otherUserId={otherUserId} chatId={chatId} />
            </div>
          )}
        </Card>
      </AppLayout>
    </ChatGuard>
  );
};

export default ChatPage;
