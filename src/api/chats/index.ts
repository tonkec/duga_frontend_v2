import { apiClient } from '..';

export type CreateChatInput =
  | { partnerId: number }
  | {
      userIds: number[];
      name: string;
    };

export const createChat = async (data: CreateChatInput) => {
  const client = apiClient();
  return client.post('/chats/create', data);
};

export const getAllUserChats = async () => {
  const client = apiClient();
  return client.get(`/chats`, {
    skipGlobalErrorHandler: true,
  });
};

const getChatsFromResponseData = (data: unknown) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const responseData = data as Record<string, unknown>;
  if (Array.isArray(responseData.chats)) return responseData.chats;
  if (Array.isArray(responseData.Chats)) return responseData.Chats;
  if (Array.isArray(responseData.data)) return responseData.data;

  return [];
};

export const getCurrentChat = async (chatId: string) => {
  const client = apiClient();
  const response = await client.get(`/chats`, {
    skipGlobalErrorHandler: true,
  });
  const chats = getChatsFromResponseData(response.data);

  return {
    ...response,
    data: chats.find((chat) => Number(chat.id ?? chat.ChatUser?.chatId) === Number(chatId)),
  };
};

export const deleteCurrentChat = async (chatId: string) => {
  const client = apiClient();
  return client.delete(`/chats/${chatId}`);
};

export const leaveCurrentChat = async (chatId: string) => {
  const client = apiClient();
  return client.post<{
    chatId: number;
    userId: number;
    notifyUsers: number[];
    newAdminUserId?: number;
  }>(`/chats/${chatId}/leave`);
};
