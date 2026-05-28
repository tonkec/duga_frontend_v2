export type ChatMemberLike = {
  id?: number;
  userId?: number;
  publicId?: string;
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

const LEGACY_MEMBERS_STORAGE_KEY = 'dugaAdditionalChatMembers';
const LEGACY_ADMINS_STORAGE_KEY = 'dugaGroupChatAdmins';

const getChatMemberId = (user: ChatMemberLike) => {
  const id = Number(user.id ?? user.userId);
  return Number.isFinite(id) ? id : undefined;
};

export const clearLegacyChatMemberStorage = () => {
  localStorage.removeItem(LEGACY_MEMBERS_STORAGE_KEY);
  localStorage.removeItem(LEGACY_ADMINS_STORAGE_KEY);
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
