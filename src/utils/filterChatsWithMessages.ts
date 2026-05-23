export const chatHasMessages = (chat: { Messages?: unknown[] | null }) =>
  (chat.Messages?.length ?? 0) > 0;

export const filterChatsWithMessages = <T extends { Messages?: unknown[] | null }>(
  chats: T[] | undefined
): T[] => (chats ?? []).filter(chatHasMessages);
