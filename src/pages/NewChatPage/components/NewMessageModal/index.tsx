import { useMemo, useState } from 'react';
import Modal from 'react-modal';
import { BiSearch } from 'react-icons/bi';
import { useNavigate } from 'react-router';
import Input from '@app/components/Input';
import Loader from '@app/components/Loader';
import Button from '@app/components/Button';
import UserAvatar from '@app/components/UserAvatar';
import { IUser } from '@app/components/UserCard';
import { useGetAllUsers } from '@app/hooks/useGetAllUsers';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import { IChat, useCreateNewChat } from '@app/pages/NewChatPage/hooks';
import { hasAlreadyChatted } from '@app/components/SendMessageButton/utils/hasAlreadyChatted';

Modal.setAppElement('#root');

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(100vw - 2rem, 28rem)',
    maxHeight: 'min(85vh, 32rem)',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid #dce4ff',
  },
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
};

const getChatWithOtherUser = (userChats: IChat[] | undefined, partnerId: number) =>
  userChats?.find((chat) => chat.Users[0].id === partnerId);

interface INewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewMessageModal = ({ isOpen, onClose }: INewMessageModalProps) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const { userChats, isUserChatsLoading } = useGetAllUserChats(isOpen);
  const { onCreateChat, isCreatingChat } = useCreateNewChat();

  const currentUserId = currentUser?.data?.id;

  const selectableUsers = useMemo(() => {
    const verifiedOthers =
      allUsers?.data?.filter(
        (user: IUser) => user.isVerified && user.id !== Number(currentUserId)
      ) ?? [];

    const query = search.trim().toLowerCase();
    if (!query) return verifiedOthers;

    return verifiedOthers.filter((user: IUser) => user.username?.toLowerCase().includes(query));
  }, [allUsers?.data, currentUserId, search]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelectUser = (partnerId: number) => {
    if (isCreatingChat) return;

    const existingChat = getChatWithOtherUser(userChats?.data, partnerId);

    if (hasAlreadyChatted(userChats?.data, String(partnerId)) && existingChat) {
      handleClose();
      navigate(`/chat/${existingChat.id}`);
      return;
    }

    onCreateChat({ partnerId });
    handleClose();
  };

  const isLoading = isAllUsersLoading || isUserLoading || (isOpen && isUserChatsLoading);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={modalStyles}
      contentLabel="Nova poruka"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nova poruka</h2>
            <p className="mt-0.5 text-sm text-gray-500">Odaberi korisnika po korisničkom imenu</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Zatvori"
          >
            ✕
          </button>
        </div>

        <Input
          type="text"
          placeholder="Pretraži po korisničkom imenu..."
          icon={<BiSearch color="grey" fontSize="20px" className="mt-[1.5px]" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="w-full py-2 pl-10"
        />

        <ul className="-mx-1 max-h-64 overflow-y-auto" role="listbox" aria-label="Korisnici">
          {isLoading ? (
            <li className="flex justify-center py-8">
              <Loader />
            </li>
          ) : selectableUsers.length === 0 ? (
            <li className="py-8 text-center text-sm text-gray-500">
              {search.trim() ? 'Nema korisnika za taj upit' : 'Nema dostupnih korisnika'}
            </li>
          ) : (
            selectableUsers.map((user: IUser) => (
              <li key={user.id}>
                <button
                  type="button"
                  role="option"
                  disabled={isCreatingChat}
                  onClick={() => handleSelectUser(user.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[#f0f4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue disabled:opacity-50"
                >
                  <UserAvatar
                    color="#F037A5"
                    avatarFallbackName={user.username}
                    userId={String(user.id)}
                    className="h-10 w-10 rounded-full"
                  />
                  <span className="truncate font-medium text-gray-900">{user.username}</span>
                </button>
              </li>
            ))
          )}
        </ul>

        <Button type="black" className="w-full" onClick={handleClose}>
          Odustani
        </Button>
      </div>
    </Modal>
  );
};

export default NewMessageModal;
