import { useNavigate, useParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import Card from '@app/components/Card';
import SendMessage from './components/SendMessage';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatGuard from './components/ChatGuard';
import PaginatedMessages from './components/PaginatedMessages';
import { useDeleteCurrentChat, useGetAllMessages, useGetCurrentChat } from './hooks';
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
import { useQueryClient } from '@tanstack/react-query';

interface ITypingData {
  userId: number;
}

interface IDeleteChatModalProps {
  setIsDeleteModalVisible: (value: boolean) => void;
  onDeleteChat: () => void;
  isDeleteModalVisible: boolean;
}

type MessagesQueryData = {
  pages?: Array<{
    data?: {
      messages?: IMessage[];
    };
  }>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getReactionPayloadRecord = (payload: unknown): Record<string, unknown> | undefined => {
  if (!isRecord(payload)) return undefined;

  if (isRecord(payload.message)) return payload.message;
  if (isRecord(payload.data)) {
    if (isRecord(payload.data.message)) return payload.data.message;
    return payload.data;
  }

  return payload;
};

const getReactionPayloadMessageId = (payload: unknown) => {
  if (!isRecord(payload)) return undefined;

  const nestedMessage = isRecord(payload.message) ? payload.message : undefined;
  const nestedData = isRecord(payload.data) ? payload.data : undefined;
  const nestedDataMessage =
    nestedData && isRecord(nestedData.message) ? nestedData.message : undefined;

  return [
    payload.messageId,
    payload.id,
    nestedMessage?.messageId,
    nestedMessage?.id,
    nestedData?.messageId,
    nestedData?.id,
    nestedDataMessage?.messageId,
    nestedDataMessage?.id,
  ]
    .map(toNumber)
    .find((id) => id !== undefined);
};

const getCurrentUserReactions = (message: IMessage) => [
  ...(message.userReactions ?? []),
  ...(message.currentUserReactions ?? []),
  ...(message.myReactions ?? []),
];

const updateMessageReactionLocally = (message: IMessage, emoji: string, hasReacted: boolean) => {
  const reactions = message.reactions ?? message.Reactions ?? [];
  const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);
  const currentUserReactions = getCurrentUserReactions(message);
  const previouslyReacted = currentUserReactions.includes(emoji);
  const currentCount = Math.max(
    0,
    Number(existingReaction?.count ?? existingReaction?.reactionCount ?? 0)
  );
  const nextCount = hasReacted
    ? currentCount + (previouslyReacted ? 0 : 1)
    : Math.max(0, currentCount - (previouslyReacted ? 1 : 0));
  const nextReaction = {
    ...existingReaction,
    emoji,
    count: nextCount,
    reactedByCurrentUser: hasReacted,
  };
  const nextReactions = existingReaction
    ? reactions.map((reaction) => (reaction.emoji === emoji ? nextReaction : reaction))
    : [...reactions, nextReaction];
  const nextUserReactions = hasReacted
    ? Array.from(new Set([...currentUserReactions, emoji]))
    : currentUserReactions.filter((reactionEmoji) => reactionEmoji !== emoji);
  const currentTotalCount = Number(
    message.reactionCount ??
      reactions.reduce((sum, reaction) => {
        return sum + Math.max(0, Number(reaction.count ?? reaction.reactionCount ?? 0));
      }, 0)
  );
  const nextTotalCount = Math.max(
    0,
    currentTotalCount +
      (hasReacted && !previouslyReacted ? 1 : !hasReacted && previouslyReacted ? -1 : 0)
  );

  return {
    ...message,
    reactions: nextReactions.filter((reaction) => Number(reaction.count ?? 0) > 0),
    reactionCount: nextTotalCount,
    userReactions: nextUserReactions,
  };
};

const mergeReactionSocketUpdate = (message: IMessage, payload: unknown): IMessage => {
  const reactionData = getReactionPayloadRecord(payload);
  if (!reactionData) return message;

  const textMessage =
    typeof reactionData.message === 'string' ? reactionData.message : message.message;
  const nextMessage = {
    ...message,
    ...reactionData,
    message: textMessage,
  } as IMessage;
  const emoji = typeof reactionData.emoji === 'string' ? reactionData.emoji : undefined;

  if (!emoji || Array.isArray(reactionData.reactions) || Array.isArray(reactionData.Reactions)) {
    return nextMessage;
  }

  const reactions = nextMessage.reactions ?? nextMessage.Reactions ?? [];
  const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);
  const nextCount = toNumber(reactionData.count) ?? toNumber(reactionData.reactionCount);
  if (nextCount === undefined) return nextMessage;

  const nextReaction = {
    ...existingReaction,
    emoji,
    count: nextCount,
    reactedByCurrentUser:
      typeof reactionData.reactedByCurrentUser === 'boolean'
        ? reactionData.reactedByCurrentUser
        : existingReaction?.reactedByCurrentUser,
  };
  const nextReactions = existingReaction
    ? reactions.map((reaction) => (reaction.emoji === emoji ? nextReaction : reaction))
    : [...reactions, nextReaction];

  return {
    ...nextMessage,
    reactions: nextReactions.filter((reaction) => Number(reaction.count ?? 0) > 0),
  };
};

const updateMessageInQueryData = (
  data: MessagesQueryData | undefined,
  messageId: number,
  updateMessage: (message: IMessage) => IMessage
) => {
  if (!data?.pages) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        messages: page.data?.messages?.map((message) =>
          Number(message.id) === Number(messageId) ? updateMessage(message) : message
        ),
      },
    })),
  };
};

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
  const queryClient = useQueryClient();
  const { user: currentUser, isUserLoading: isCurrentUserLoading } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const { chatId } = useParams();
  const [receivedMessages, setReceivedMessages] = useState<IMessage[]>([]);
  const { currentChat, isCurrentChatLoading, isCurrentChatError } = useGetCurrentChat(
    chatId as string
  );
  const { messages, fetchNextPage } = useGetAllMessages(chatId as string);
  const hasMessages = messages.length + receivedMessages.length > 0;
  const otherUserId = getOtherUser(currentChat?.data, currentUserId as string)?.userId;
  const { deleteChat } = useDeleteCurrentChat(socket);

  const { user: otherUser } = useGetUserById(String(otherUserId || ''));
  const otherUserName = otherUser?.data.username;
  const currentUserName = currentUser?.data.username;

  const [isOnlineState, setIsOnlineState] = useState<boolean>(otherUser?.data?.status === 'online');

  const updateMessageEverywhere = useCallback(
    (messageId: number, updateMessage: (message: IMessage) => IMessage) => {
      setReceivedMessages((prevMessages) =>
        prevMessages.map((message) =>
          Number(message.id) === Number(messageId) ? updateMessage(message) : message
        )
      );

      queryClient.setQueryData<MessagesQueryData>(['messages', chatId], (data) =>
        updateMessageInQueryData(data, messageId, updateMessage)
      );
    },
    [chatId, queryClient]
  );

  const handleReactionToggle = useCallback(
    (message: IMessage, emoji: string, hasReacted: boolean) => {
      if (!socket || !message.id || !currentUserId) return;

      const nextHasReacted = !hasReacted;
      updateMessageEverywhere(message.id, (currentMessage) =>
        updateMessageReactionLocally(currentMessage, emoji, nextHasReacted)
      );
      socket.emit(nextHasReacted ? 'react-message' : 'remove-message-reaction', {
        messageId: message.id,
        emoji,
      });
    },
    [currentUserId, socket, updateMessageEverywhere]
  );

  useEffect(() => {
    if (!socket) return;

    const handleReceived = (data: IMessage) => {
      setReceivedMessages((prev) => [...prev, data]);
    };

    socket.on('received', handleReceived);

    return () => {
      socket.off('received', handleReceived);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReactionUpdate = (payload: unknown) => {
      const messageId = getReactionPayloadMessageId(payload);
      if (!messageId) {
        queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
        queryClient.invalidateQueries({ queryKey: ['userChats'] });
        return;
      }

      updateMessageEverywhere(messageId, (message) => mergeReactionSocketUpdate(message, payload));
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };

    const handleReactionError = () => {
      toast.error('Reakciju nije moguće spremiti. Probaj opet.', toastConfig);
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };

    socket.on('message-reaction-updated', handleReactionUpdate);
    socket.on('message_reaction_error', handleReactionError);

    return () => {
      socket.off('message-reaction-updated', handleReactionUpdate);
      socket.off('message_reaction_error', handleReactionError);
    };
  }, [chatId, queryClient, socket, updateMessageEverywhere]);

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
                color="#eef3ff"
                fgColor="#2D46B9"
                avatarFallbackName={otherUserName ?? ''}
                userId={String(otherUserId ?? '')}
                className="h-11 w-11 shrink-0 rounded-full border border-[#dce4ff]"
              />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-gray-900">{otherUserName}</h1>
                <p className="text-xs text-gray-500">{isOnlineState ? 'Na mreži' : 'Offline'}</p>
              </div>
            </button>
            {hasMessages && (
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
            )}
          </header>

          <div className="flex min-h-[360px] flex-col bg-[#f7f9ff]">
            <PaginatedMessages
              currentUserName={currentUserName}
              otherUserName={otherUserName}
              otherUserId={otherUserId as number}
              receivedMessages={receivedMessages}
              messages={messages}
              fetchNextPage={fetchNextPage}
              currentUserId={currentUserId as number}
              isCurrentUserLoading={isCurrentUserLoading}
              onReactionToggle={handleReactionToggle}
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
