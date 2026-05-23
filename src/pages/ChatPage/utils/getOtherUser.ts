interface IChatUser {
  userId: number;
}

export const getOtherUser = (chatUsers: IChatUser[] | undefined, currentUserId: string) => {
  if (!Array.isArray(chatUsers)) return null;
  return chatUsers.find((user) => user.userId !== Number(currentUserId));
};
