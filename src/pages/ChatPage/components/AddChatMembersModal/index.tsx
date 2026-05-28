import { useMemo, useState } from 'react';
import Modal from 'react-modal';
import { BiSearch } from 'react-icons/bi';
import Button from '@app/components/Button';
import Input from '@app/components/Input';
import Loader from '@app/components/Loader';
import UserAvatar from '@app/components/UserAvatar';
import { IUser } from '@app/components/UserCard';
import { useGetAllUsers } from '@app/hooks/useGetAllUsers';
import { MAX_GROUP_CHAT_MEMBERS } from '@app/utils/consts';

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

interface IAddChatMembersModalProps {
  isOpen: boolean;
  memberIds: number[];
  onClose: () => void;
  onAddMembers: (users: IUser[]) => void;
}

const AddChatMembersModal = ({
  isOpen,
  memberIds,
  onClose,
  onAddMembers,
}: IAddChatMembersModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const { allUsers, isAllUsersLoading } = useGetAllUsers({ enabled: isOpen });

  const memberIdSet = useMemo(() => new Set(memberIds.map(Number)), [memberIds]);
  const remainingMemberSlots = Math.max(0, MAX_GROUP_CHAT_MEMBERS - memberIdSet.size);
  const hasReachedMemberLimit = remainingMemberSlots === 0;
  const hasSelectedAllRemainingSlots = selectedUserIds.length >= remainingMemberSlots;

  const availableUsers = useMemo(
    () =>
      allUsers?.data?.filter(
        (user: IUser) => user.isVerified && !memberIdSet.has(Number(user.id))
      ) ?? [],
    [allUsers?.data, memberIdSet]
  );

  const selectableUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return availableUsers;

    return availableUsers.filter((user: IUser) => user.username?.toLowerCase().includes(query));
  }, [availableUsers, search]);

  const selectedUsers = useMemo(
    () => availableUsers.filter((user: IUser) => selectedUserIds.includes(user.id)),
    [availableUsers, selectedUserIds]
  );

  const handleClose = () => {
    setSearch('');
    setSelectedUserIds([]);
    onClose();
  };

  const handleAddMembers = () => {
    if (!selectedUsers.length || selectedUsers.length > remainingMemberSlots) return;

    onAddMembers(selectedUsers);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={modalStyles}
      contentLabel="Dodaj osobe u razgovor"
    >
      <div className="flex max-h-[inherit] flex-col bg-white">
        <div className="border-b border-[#e8eeff] bg-gradient-to-br from-[#f7f9ff] to-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mb-2 inline-flex rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">
                Razgovor
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">Dodaj osobe</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Odaberi jednu ili više osoba koje želiš dodati u ovaj razgovor.
              </p>
              <p className="mt-3 rounded-2xl border border-blue/20 bg-blue/10 px-4 py-3 text-sm leading-6 text-blue-dark">
                Novi članovi moći će vidjeti cijelu povijest razgovora.
              </p>
              <p className="mt-2 rounded-2xl border border-[#dce4ff] bg-white px-4 py-3 text-sm leading-6 text-gray-600">
                Grupni chat može imati najviše {MAX_GROUP_CHAT_MEMBERS} članova. Možeš dodati još{' '}
                {remainingMemberSlots} osoba.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-gray-400 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Zatvori"
            >
              x
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
            aria-label="Korisnici za dodavanje"
          >
            {isAllUsersLoading ? (
              <li className="flex justify-center rounded-2xl border border-dashed border-[#dce4ff] py-10">
                <Loader variant="inline" label="Učitavanje korisnika..." />
              </li>
            ) : hasReachedMemberLimit ? (
              <li className="rounded-2xl border border-dashed border-[#dce4ff] bg-[#f7f9ff] px-4 py-10 text-center text-sm text-gray-500">
                Ovaj grupni chat već ima maksimalnih {MAX_GROUP_CHAT_MEMBERS} članova.
              </li>
            ) : selectableUsers.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-[#dce4ff] bg-[#f7f9ff] px-4 py-10 text-center text-sm text-gray-500">
                {search.trim()
                  ? 'Nema korisnika za taj upit'
                  : 'Nema dostupnih korisnika za dodavanje'}
              </li>
            ) : (
              selectableUsers.map((user: IUser) => {
                const isSelected = selectedUserIds.includes(user.id);
                const isDisabled = hasSelectedAllRemainingSlots && !isSelected;

                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={isDisabled}
                      onClick={() =>
                        setSelectedUserIds((currentIds) =>
                          isSelected
                            ? currentIds.filter((id) => id !== user.id)
                            : currentIds.length >= remainingMemberSlots
                              ? currentIds
                              : [...currentIds, user.id]
                        )
                      }
                      className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all hover:border-[#dce4ff] hover:bg-[#f7f9ff] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-50 ${
                        isSelected ? 'border-blue bg-blue/10' : 'border-transparent bg-white'
                      }`}
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
                        <span className="text-xs text-gray-500">
                          {isDisabled
                            ? `Limit je ${MAX_GROUP_CHAT_MEMBERS} članova`
                            : 'Klikni za odabir'}
                        </span>
                      </div>
                      <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue-dark opacity-0 transition-opacity group-hover:opacity-100">
                        {isSelected ? 'Odabrano' : 'Odaberi'}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <Button
            type="blue"
            className="w-full rounded-full py-3"
            onClick={handleAddMembers}
            disabled={!selectedUsers.length || selectedUsers.length > remainingMemberSlots}
          >
            Dodaj odabrane
          </Button>

          <Button type="black" className="w-full rounded-full py-3" onClick={handleClose}>
            Odustani
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddChatMembersModal;
