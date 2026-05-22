interface IChatUser {
  userId: number;
}

export const getOtherUser = (chatUsers: IChatUser[] | undefined, currentUserId: string) => {
  if (!chatUsers) return null;
  return chatUsers.find((user) => user.userId !== Number(currentUserId));
};
