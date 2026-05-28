import { IUser } from '@app/components/UserCard';

export const getVisibleVerifiedUsers = (users: IUser[] = [], currentUserId?: number | string) =>
  (Array.isArray(users) ? users : []).filter(
    (user) => user.isVerified && Number(user.id) !== Number(currentUserId)
  );

export const filterUsers = (
  users: IUser[],
  search: string,
  selectValue: { value: string; label: string }
) => {
  if (!search) return users;

  const value = search.toLowerCase();

  return users.filter((user) => {
    if (selectValue.value === 'username') return user?.username?.toLowerCase().includes(value);
    if (selectValue.value === 'gender') return user?.gender?.toLowerCase().includes(value);
    if (selectValue.value === 'sexuality') return user?.sexuality?.toLowerCase().includes(value);
    if (selectValue.value === 'location') return user?.location?.toLowerCase().includes(value);
    return false;
  });
};

export const getLastOnlineUsers = (users: IUser[], limit = 4) =>
  [...users]
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'online' ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, limit);
