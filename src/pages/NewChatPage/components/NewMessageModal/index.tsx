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
    width: 'min(100vw - 2rem, 34rem)',
    maxHeight: 'min(88vh, 38rem)',
    padding: 0,
    borderRadius: '1.5rem',
    border: '1px solid #dce4ff',
    background: '#ffffff',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.22)',
  },
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
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
      <div className="flex max-h-[inherit] flex-col bg-white">
        <div className="border-b border-[#e8eeff] bg-gradient-to-br from-[#f7f9ff] to-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mb-2 inline-flex rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">
                Nova poruka
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">Pronađi korisnika</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Pretraži verificirane korisnike i započni razgovor.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-gray-400 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Zatvori"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 px-5 py-5 sm:px-6">
          <Input
            type="text"
            placeholder="Pretraži po korisničkom imenu..."
            icon={<BiSearch color="grey" fontSize="20px" className="mt-[1.5px]" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="w-full rounded-xl border-[#dce4ff] bg-[#f7f9ff] py-3 pl-10"
          />

          <ul
            className="max-h-72 space-y-2 overflow-y-auto pr-1"
            role="listbox"
            aria-label="Korisnici"
          >
            {isLoading ? (
              <li className="flex justify-center rounded-2xl border border-dashed border-[#dce4ff] py-10">
                <Loader variant="inline" label="Učitavanje korisnika..." />
              </li>
            ) : selectableUsers.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-[#dce4ff] bg-[#f7f9ff] px-4 py-10 text-center text-sm text-gray-500">
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
                    className="group flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left transition-all hover:border-[#dce4ff] hover:bg-[#f7f9ff] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue disabled:opacity-50"
                  >
                    <UserAvatar
                      color="#2D46B9"
                      avatarFallbackName={user.username}
                      userId={String(user.id)}
                      className="h-11 w-11 rounded-full"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-gray-950">
                        {user.username}
                      </span>
                      <span className="text-xs text-gray-500">Klikni za početak razgovora</span>
                    </div>
                    <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue-dark opacity-0 transition-opacity group-hover:opacity-100">
                      Odaberi
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          <Button type="black" className="w-full rounded-full py-3" onClick={handleClose}>
            Odustani
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewMessageModal;
