import { IChat } from '@app/pages/NewChatPage/hooks';

export const hasAlreadyChatted = (userChats: IChat[] | undefined, userId: string) => {
  return userChats?.some(
    (chat: IChat) =>
      chat.type !== 'group' && chat.Users.some((user) => Number(user.id) === Number(userId))
  );
};
