import { useSyncUserChatsOnSocketMessage } from '@app/hooks/useSyncUserChatsOnSocketMessage';

const UserChatsSocketSync = () => {
  useSyncUserChatsOnSocketMessage();
  return null;
};

export default UserChatsSocketSync;
