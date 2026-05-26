import { useNavigate, useParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import Card from '@app/components/Card';
import SendMessage from './components/SendMessage';
import AddChatMembersModal from './components/AddChatMembersModal';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChatGuard from './components/ChatGuard';
import PaginatedMessages from './components/PaginatedMessages';
import {
  useDeleteCurrentChat,
  useGetAllMessages,
  useGetCurrentChat,
  useLeaveCurrentChat,
} from './hooks';
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
import { IUser } from '@app/components/UserCard';
import { BiGroup } from 'react-icons/bi';
import {
  addStoredAdditionalChatMembers,
  getStoredGroupChatAdminId,
  mergeChatMembers,
  mergeStoredChatMembers,
  removeStoredGroupChatAdmin,
  removeStoredChatMember,
  removeStoredChatMembers,
  setStoredGroupChatAdmin,
} from '@app/utils/chatMemberStorage';

interface ITypingData {
  userId: number;
}

interface IChatParticipant {
  id?: number;
  userId?: number;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  ChatUser?: {
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface IChatDetails {
  id?: number;
  type?: string;
  name?: string;
  Users?: IChatParticipant[];
}

interface IDeleteChatModalProps {
  setIsDeleteModalVisible: (value: boolean) => void;
  onDeleteChat: () => void;
  isDeleteModalVisible: boolean;
}

interface ILeaveChatModalProps {
  setIsLeaveModalVisible: (value: boolean) => void;
  onLeaveChat: () => void;
  isLeaveModalVisible: boolean;
  isLeavingChat: boolean;
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

const getCurrentChatUsers = (chatData: IChatDetails | IChatParticipant[] | undefined) => {
  if (Array.isArray(chatData)) {
    return chatData.map((user) => ({
      ...user,
      id: user.id ?? user.userId,
    }));
  }

  return (
    chatData?.Users?.map((user) => ({
      ...user,
      id: user.id ?? user.userId,
    })) ?? []
  );
};

const getChatTitle = ({
  isGroup,
  chat,
  otherUserName,
  otherMembers,
}: {
  isGroup: boolean;
  chat: IChatDetails | undefined;
  otherUserName: string | undefined;
  otherMembers: IChatParticipant[];
}) => {
  if (!isGroup) return otherUserName || 'Razgovor';
  return (
    chat?.name ||
    otherMembers
      .map((user) => user.username)
      .filter(Boolean)
      .join(', ') ||
    'Grupa'
  );
};

const getMemberJoinedAt = (member: IChatParticipant) => {
  const timestamp =
    member.ChatUser?.createdAt ??
    member.createdAt ??
    member.ChatUser?.updatedAt ??
    member.updatedAt;
  const joinedAt = timestamp ? new Date(timestamp).getTime() : Number.NaN;
  return Number.isFinite(joinedAt) ? joinedAt : undefined;
};

const getOldestMemberUserId = (members: IChatParticipant[]) => {
  const oldestMember = members
    .map((member, index) => ({
      member,
      index,
      joinedAt: getMemberJoinedAt(member),
    }))
    .sort((a, b) => {
      if (a.joinedAt !== undefined && b.joinedAt !== undefined) return a.joinedAt - b.joinedAt;
      if (a.joinedAt !== undefined) return -1;
      if (b.joinedAt !== undefined) return 1;
      return a.index - b.index;
    })[0]?.member;

  const userId = Number(oldestMember?.id ?? oldestMember?.userId);
  return Number.isFinite(userId) ? userId : undefined;
};

const getNextAdminUserId = (members: IChatParticipant[], removedUserId: number) =>
  getOldestMemberUserId(
    members.filter((member) => Number(member.id ?? member.userId) !== Number(removedUserId))
  );

const getAdminUserIdFromMembers = (members: IChatParticipant[]) => {
  const adminUserId = members.find(
    (member) => member.role === 'admin' || member.ChatUser?.role === 'admin'
  )?.id;

  if (adminUserId !== undefined) return adminUserId;

  return getOldestMemberUserId(members);
};

const addUsersToChatData = (chatData: unknown, chatId: string, usersToAdd: IUser[]): unknown => {
  if (Array.isArray(chatData)) {
    return mergeChatMembers(chatData as IChatParticipant[], usersToAdd);
  }

  if (!isRecord(chatData)) return chatData;

  return {
    ...chatData,
    id: chatData.id ?? Number(chatId),
    type: 'group',
    Users: mergeChatMembers(
      Array.isArray(chatData.Users) ? (chatData.Users as IChatParticipant[]) : [],
      usersToAdd
    ),
  };
};

const addUsersToChatCollection = (
  collectionData: unknown,
  chatId: string,
  usersToAdd: IUser[]
): unknown => {
  if (Array.isArray(collectionData)) {
    return collectionData.map((chat) => {
      if (!isRecord(chat)) return chat;
      const currentChatId = Number(
        chat.id ?? (isRecord(chat.ChatUser) ? chat.ChatUser.chatId : undefined)
      );

      return currentChatId === Number(chatId) ? addUsersToChatData(chat, chatId, usersToAdd) : chat;
    });
  }

  if (!isRecord(collectionData)) return collectionData;

  return ['data', 'chats', 'Chats'].reduce<Record<string, unknown>>((nextData, key) => {
    if (!Array.isArray(nextData[key])) return nextData;

    return {
      ...nextData,
      [key]: addUsersToChatCollection(nextData[key], chatId, usersToAdd),
    };
  }, collectionData);
};

const addUsersToQueryResponseData = (
  queryData: unknown,
  updateData: (data: unknown) => unknown
): unknown => {
  if (!isRecord(queryData)) return queryData;

  return {
    ...queryData,
    data: updateData(queryData.data),
  };
};

const removeUserFromChatData = (chatData: unknown, userId: number): unknown => {
  if (Array.isArray(chatData)) {
    return chatData.filter((user) => Number(user.id ?? user.userId) !== Number(userId));
  }

  if (!isRecord(chatData)) return chatData;

  return {
    ...chatData,
    Users: Array.isArray(chatData.Users)
      ? chatData.Users.filter((user) => Number(user.id ?? user.userId) !== Number(userId))
      : chatData.Users,
  };
};

const removeChatFromCollection = (collectionData: unknown, chatId: string): unknown => {
  if (Array.isArray(collectionData)) {
    return collectionData.filter((chat) => {
      if (!isRecord(chat)) return true;
      const currentChatId = Number(
        chat.id ?? (isRecord(chat.ChatUser) ? chat.ChatUser.chatId : undefined)
      );

      return currentChatId !== Number(chatId);
    });
  }

  if (!isRecord(collectionData)) return collectionData;

  return ['data', 'chats', 'Chats'].reduce<Record<string, unknown>>((nextData, key) => {
    if (!Array.isArray(nextData[key])) return nextData;

    return {
      ...nextData,
      [key]: removeChatFromCollection(nextData[key], chatId),
    };
  }, collectionData);
};

const removeUserFromChatCollection = (
  collectionData: unknown,
  chatId: string,
  userId: number
): unknown => {
  if (Array.isArray(collectionData)) {
    return collectionData.map((chat) => {
      if (!isRecord(chat)) return chat;
      const currentChatId = Number(
        chat.id ?? (isRecord(chat.ChatUser) ? chat.ChatUser.chatId : undefined)
      );

      return currentChatId === Number(chatId) ? removeUserFromChatData(chat, userId) : chat;
    });
  }

  if (!isRecord(collectionData)) return collectionData;

  return ['data', 'chats', 'Chats'].reduce<Record<string, unknown>>((nextData, key) => {
    if (!Array.isArray(nextData[key])) return nextData;

    return {
      ...nextData,
      [key]: removeUserFromChatCollection(nextData[key], chatId, userId),
    };
  }, collectionData);
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

const LeaveChatModal = ({
  setIsLeaveModalVisible,
  onLeaveChat,
  isLeaveModalVisible,
  isLeavingChat,
}: ILeaveChatModalProps) => {
  return (
    <ConfirmModal
      isOpen={isLeaveModalVisible}
      onConfirm={onLeaveChat}
      onClose={() => setIsLeaveModalVisible(false)}
    >
      <h2 className="text-xl text-center">Želiš li izaći iz ovog grupnog razgovora?</h2>
      <p className="text-center">
        {isLeavingChat ? 'Izlazak iz razgovora...' : 'Razgovor će biti maknut iz tvoje liste.'}
      </p>
    </ConfirmModal>
  );
};

const ChatPage = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
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
  const currentChatData = currentChat?.data as IChatDetails | IChatParticipant[] | undefined;
  const backendChatUsers = useMemo(() => getCurrentChatUsers(currentChatData), [currentChatData]);
  const chatUsers = useMemo(
    () => (chatId ? mergeStoredChatMembers(chatId, backendChatUsers) : backendChatUsers),
    [backendChatUsers, chatId]
  );
  const otherMembers = useMemo(
    () => chatUsers.filter((user) => Number(user.id) !== Number(currentUserId)),
    [chatUsers, currentUserId]
  );
  const otherMemberIds = useMemo(
    () => otherMembers.map((user) => Number(user.id)).filter((userId) => Number.isFinite(userId)),
    [otherMembers]
  );
  const memberIds = useMemo(
    () => chatUsers.map((user) => Number(user.id)).filter((userId) => Number.isFinite(userId)),
    [chatUsers]
  );
  const fallbackOtherUserId = getOtherUser(
    chatUsers.map((user) => ({ userId: Number(user.id) })),
    currentUserId as string
  )?.userId;
  const otherUserId = otherMemberIds[0] ?? fallbackOtherUserId;
  const isGroupChat =
    !Array.isArray(currentChatData) && (currentChatData?.type === 'group' || chatUsers.length > 1);
  const groupAdminUserId =
    (chatId ? getStoredGroupChatAdminId(chatId) : undefined) ??
    getAdminUserIdFromMembers(chatUsers);
  const isCurrentUserGroupAdmin =
    Boolean(isGroupChat) &&
    groupAdminUserId !== undefined &&
    Number(groupAdminUserId) === Number(currentUserId);
  const { deleteChat } = useDeleteCurrentChat(socket);
  const { leaveChat, isLeavingChat } = useLeaveCurrentChat();

  const { user: otherUser } = useGetUserById(String(otherUserId || ''));
  const otherUserName = otherUser?.data.username;
  const chatTitle = getChatTitle({
    isGroup: Boolean(isGroupChat),
    chat: !Array.isArray(currentChatData) ? currentChatData : undefined,
    otherUserName,
    otherMembers,
  });
  const currentUserName = currentUser?.data.username;
  const chatMemberNames = useMemo(() => {
    const names = chatUsers.map((user) => {
      const userId = Number(user.id);
      if (user.username) return user.username;
      if (userId === Number(currentUserId) && currentUserName) return currentUserName;
      if (userId === Number(otherUserId) && otherUserName) return otherUserName;
      return `Korisnik #${userId}`;
    });

    return Array.from(new Set(names));
  }, [chatUsers, currentUserId, currentUserName, otherUserId, otherUserName]);

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

  const applyUserRemovedFromChat = useCallback(
    ({
      removedChatId,
      removedUserId,
      eventCurrentUserId,
      newAdminUserId,
      showCurrentUserToast = false,
    }: {
      removedChatId: string;
      removedUserId: number;
      eventCurrentUserId?: number;
      newAdminUserId?: number;
      showCurrentUserToast?: boolean;
    }) => {
      if (!removedChatId) return;
      const isCurrentUserLeaving =
        Number(eventCurrentUserId ?? removedUserId) === Number(currentUserId);
      const isRemovedUserAdmin = Number(removedUserId) === Number(groupAdminUserId);
      const nextAdminUserId =
        newAdminUserId ??
        (isRemovedUserAdmin ? getNextAdminUserId(chatUsers, removedUserId) : undefined);

      if (isCurrentUserLeaving) {
        removeStoredChatMembers(removedChatId);
        removeStoredGroupChatAdmin(removedChatId);
        queryClient.removeQueries({ queryKey: ['chat', removedChatId] });
        queryClient.removeQueries({ queryKey: ['messages', removedChatId] });
        queryClient.setQueryData(['userChats'], (data) =>
          addUsersToQueryResponseData(data, (userChatsData) =>
            removeChatFromCollection(userChatsData, removedChatId)
          )
        );
        if (showCurrentUserToast) {
          toast.success('Izašao_la si iz razgovora.', toastConfig);
        }
        navigate('/new-chat', { replace: true });
        return;
      }

      removeStoredChatMember(removedChatId, removedUserId);
      if (nextAdminUserId !== undefined) {
        setStoredGroupChatAdmin(removedChatId, Number(nextAdminUserId));
      }
      queryClient.setQueryData(['chat', removedChatId], (data) =>
        addUsersToQueryResponseData(data, (chatData) =>
          removeUserFromChatData(chatData, removedUserId)
        )
      );
      queryClient.setQueryData(['userChats'], (data) =>
        addUsersToQueryResponseData(data, (userChatsData) =>
          removeUserFromChatCollection(userChatsData, removedChatId, removedUserId)
        )
      );
    },
    [chatUsers, currentUserId, groupAdminUserId, navigate, queryClient]
  );

  const handleLeaveChat = useCallback(() => {
    if (!chatId || !currentUserId) return;

    leaveChat(
      { chatId },
      {
        onSuccess: (response) => {
          const payload = response.data;
          if (payload.newAdminUserId !== undefined) {
            setStoredGroupChatAdmin(String(payload.chatId), Number(payload.newAdminUserId));
          }
          applyUserRemovedFromChat({
            removedChatId: String(payload.chatId),
            removedUserId: Number(payload.userId),
            eventCurrentUserId: Number(payload.userId),
            newAdminUserId: payload.newAdminUserId,
            showCurrentUserToast: true,
          });
        },
      }
    );
    setIsLeaveModalVisible(false);
  }, [applyUserRemovedFromChat, chatId, currentUserId, leaveChat]);

  const handleAddMembers = useCallback(
    (users: IUser[]) => {
      if (!socket || !chatId || !users.length) return;

      const chatForSocket = Array.isArray(currentChatData)
        ? {
            id: Number(chatId),
            type: 'group',
            name: chatTitle,
            Users: chatUsers,
          }
        : {
            ...currentChatData,
            id: currentChatData?.id ?? Number(chatId),
            type: 'group',
            name: currentChatData?.name || chatTitle,
          };
      const nextUsers = [...chatUsers, ...users];

      users.forEach((newChatter) => {
        socket.emit('add-user-to-group', {
          chat: {
            ...chatForSocket,
            Users: nextUsers,
          },
          newChatter,
        });
      });

      addStoredAdditionalChatMembers(chatId, users);
      queryClient.setQueryData(['chat', chatId], (data) =>
        addUsersToQueryResponseData(data, (chatData) => addUsersToChatData(chatData, chatId, users))
      );
      queryClient.setQueryData(['userChats'], (data) =>
        addUsersToQueryResponseData(data, (userChatsData) =>
          addUsersToChatCollection(userChatsData, chatId, users)
        )
      );
      toast.success('Osobe su dodane u razgovor.', toastConfig);
    },
    [chatId, chatTitle, chatUsers, currentChatData, queryClient, socket]
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
      if (Number(data.chatId) !== Number(chatId)) return;
      setReceivedMessages((prev) => [...prev, data]);
    };

    socket.on('received', handleReceived);

    return () => {
      socket.off('received', handleReceived);
    };
  }, [chatId, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleRemoveUserFromChat = ({
      chatId: removedChatId,
      userId: removedUserId,
      currentUserId: eventCurrentUserId,
      newAdminUserId,
    }: {
      chatId: number | string;
      userId: number;
      currentUserId?: number;
      newAdminUserId?: number;
    }) => {
      applyUserRemovedFromChat({
        removedChatId: String(removedChatId),
        removedUserId: Number(removedUserId),
        eventCurrentUserId,
        newAdminUserId,
      });
    };

    socket.on('remove-user-from-chat', handleRemoveUserFromChat);

    return () => {
      socket.off('remove-user-from-chat', handleRemoveUserFromChat);
    };
  }, [applyUserRemovedFromChat, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageError = () => {
      toast.error('Poruku nije moguće poslati. Probaj opet.', toastConfig);
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };

    const handleMessageRejected = () => {
      toast.error('Poruka je odbijena.', toastConfig);
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };

    socket.on('message_error', handleMessageError);
    socket.on('message_rejected', handleMessageRejected);

    return () => {
      socket.off('message_error', handleMessageError);
      socket.off('message_rejected', handleMessageRejected);
    };
  }, [chatId, queryClient, socket]);

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
      if (otherMemberIds.includes(Number(data.userId))) {
        setIsTyping(true);
      }
    });

    socket.on('stop-typing', (data: ITypingData) => {
      if (otherMemberIds.includes(Number(data.userId))) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('typing');
      socket.off('stop-typing');
      setIsTyping(false);
    };
  }, [socket, otherMemberIds]);

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
        {isAddMembersModalOpen && (
          <AddChatMembersModal
            isOpen={isAddMembersModalOpen}
            memberIds={memberIds}
            onClose={() => setIsAddMembersModalOpen(false)}
            onAddMembers={handleAddMembers}
          />
        )}
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
        <LeaveChatModal
          isLeaveModalVisible={isLeaveModalVisible}
          setIsLeaveModalVisible={setIsLeaveModalVisible}
          onLeaveChat={handleLeaveChat}
          isLeavingChat={isLeavingChat}
        />
        <Card className="!overflow-hidden !rounded-xl !border-[#dce4ff] !bg-white !p-0 !shadow-md">
          <header className="flex items-center justify-between gap-3 border-b border-[#e8eeff] px-4 py-3">
            <button
              type="button"
              className="flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-80 disabled:cursor-default disabled:hover:opacity-100"
              onClick={() => {
                if (!isGroupChat && otherUserId) navigate(`/user/${otherUserId}`);
              }}
              disabled={Boolean(isGroupChat)}
            >
              {isGroupChat ? (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dce4ff] bg-[#eef3ff] text-blue-dark">
                  <BiGroup size={22} />
                </span>
              ) : (
                <UserAvatar
                  color="#eef3ff"
                  fgColor="#2D46B9"
                  avatarFallbackName={chatTitle}
                  userId={String(otherUserId ?? '')}
                  className="h-11 w-11 shrink-0 rounded-full border border-[#dce4ff]"
                />
              )}
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-gray-900">{chatTitle}</h1>
                <p className="text-xs text-gray-500">
                  {isGroupChat
                    ? `${otherMembers.length + 1} članova`
                    : isOnlineState
                      ? 'Na mreži'
                      : 'Offline'}
                </p>
              </div>
            </button>
            <div className="flex shrink-0 items-center gap-2">
              {(!isGroupChat || isCurrentUserGroupAdmin) && (
                <Button
                  type="blue"
                  className="!py-1.5 !px-3 !text-xs"
                  onClick={(e) => {
                    e?.preventDefault();
                    setIsAddMembersModalOpen(true);
                  }}
                  disabled={!socket}
                >
                  Dodaj osobe
                </Button>
              )}
              {isGroupChat && (
                <Button
                  type="danger"
                  className="!py-1.5 !px-3 !text-xs"
                  onClick={(e) => {
                    e?.preventDefault();
                    setIsLeaveModalVisible(true);
                  }}
                  disabled={isLeavingChat}
                >
                  Izađi
                </Button>
              )}
              {hasMessages && (!isGroupChat || isCurrentUserGroupAdmin) && (
                <Button
                  type="danger"
                  className="!py-1.5 !px-3 !text-xs"
                  onClick={(e) => {
                    e?.preventDefault();
                    setIsDeleteModalVisible(true);
                  }}
                >
                  Izbriši
                </Button>
              )}
            </div>
          </header>

          <section className="border-b border-[#e8eeff] bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Članovi
              </span>
              {chatMemberNames.map((memberName) => (
                <span
                  key={memberName}
                  className="rounded-full bg-[#f0f4ff] px-3 py-1 text-xs font-semibold text-gray-700"
                >
                  {memberName}
                </span>
              ))}
            </div>
          </section>

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
              <SendMessage
                otherUserId={otherUserId}
                otherUserIds={otherMemberIds}
                chatId={chatId}
              />
            </div>
          )}
        </Card>
      </AppLayout>
    </ChatGuard>
  );
};

export default ChatPage;
