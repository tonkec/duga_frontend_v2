import { IChat } from '../../../pages/NewChatPage/hooks';

export const hasAlreadyChatted = (userChats: IChat[], userId: string) => {
  return userChats?.some((chat: IChat) => Number(chat.Users[0].id) === Number(userId));
};
