export type ChatMemberLike = {
  id?: number;
  userId?: number;
  username?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  ChatUser?: {
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

const STORAGE_KEY = 'dugaAdditionalChatMembers';
const ADMIN_STORAGE_KEY = 'dugaGroupChatAdmins';

const getChatMemberId = (user: ChatMemberLike) => {
  const id = Number(user.id ?? user.userId);
  return Number.isFinite(id) ? id : undefined;
};

const readStoredMembers = (): Record<string, ChatMemberLike[]> => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return {};

    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeStoredMembers = (membersByChatId: Record<string, ChatMemberLike[]>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(membersByChatId));
};

const readStoredAdmins = (): Record<string, number> => {
  try {
    const value = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!value) return {};

    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeStoredAdmins = (adminsByChatId: Record<string, number>) => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminsByChatId));
};

export const mergeChatMembers = (
  currentMembers: ChatMemberLike[] = [],
  membersToAdd: ChatMemberLike[] = []
) => {
  const membersById = new Map<number, ChatMemberLike>();

  [...currentMembers, ...membersToAdd].forEach((member) => {
    const memberId = getChatMemberId(member);
    if (memberId === undefined) return;

    membersById.set(memberId, {
      ...member,
      id: memberId,
      userId: member.userId ?? memberId,
    });
  });

  return Array.from(membersById.values());
};

export const getStoredAdditionalChatMembers = (chatId: string) => readStoredMembers()[chatId] ?? [];

export const addStoredAdditionalChatMembers = (chatId: string, membersToAdd: ChatMemberLike[]) => {
  const storedMembers = readStoredMembers();
  storedMembers[chatId] = mergeChatMembers(storedMembers[chatId], membersToAdd);
  writeStoredMembers(storedMembers);
};

export const removeStoredChatMember = (chatId: string, userId: number) => {
  const storedMembers = readStoredMembers();
  storedMembers[chatId] = (storedMembers[chatId] ?? []).filter(
    (member) => getChatMemberId(member) !== Number(userId)
  );

  if (storedMembers[chatId].length === 0) {
    delete storedMembers[chatId];
  }

  writeStoredMembers(storedMembers);
};

export const removeStoredChatMembers = (chatId: string) => {
  const storedMembers = readStoredMembers();
  delete storedMembers[chatId];
  writeStoredMembers(storedMembers);
};

export const mergeStoredChatMembers = (chatId: string, members: ChatMemberLike[]) =>
  mergeChatMembers(members, getStoredAdditionalChatMembers(chatId));

export const getStoredGroupChatAdminId = (chatId: string) => {
  const adminId = Number(readStoredAdmins()[chatId]);
  return Number.isFinite(adminId) ? adminId : undefined;
};

export const setStoredGroupChatAdmin = (chatId: string, userId: number) => {
  const admins = readStoredAdmins();
  admins[chatId] = Number(userId);
  writeStoredAdmins(admins);
};

export const removeStoredGroupChatAdmin = (chatId: string) => {
  const admins = readStoredAdmins();
  delete admins[chatId];
  writeStoredAdmins(admins);
};
