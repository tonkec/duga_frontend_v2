import AppLayout from '@app/components/AppLayout';
import Button from '@app/components/Button';
import ConfirmModal from '@app/components/ConfirmModal';
import { useState } from 'react';
import { useDeleteUser } from '../EditMyProfilePage/hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import Card from '@app/components/Card';
import OnlineStatus from '@app/components/Navigation/components/OnlineStatus';

interface IDeleteProfileModalProp {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteProfileModal = ({ isOpen, onClose, onDelete }: IDeleteProfileModalProp) => {
  return (
    <ConfirmModal isOpen={isOpen} onClose={onClose} onConfirm={onDelete}>
      <div>
        <h2 className="text-xl mb-2">Jesi li siguran_na da želiš obrisati svoj profil?</h2>
        <p className="text-sm">
          Brisanje profila briše sve tvoje fotografije, komentare, lajkove i poruke.
        </p>
      </div>
    </ConfirmModal>
  );
};
const SettingsPage = () => {
  const [userId] = useLocalStorage('userId');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { deleteUserMutation } = useDeleteUser(userId as string);

  return (
    <AppLayout>
      <DeleteProfileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => {
          setIsDeleteModalOpen(false);
          if (userId) {
            deleteUserMutation();
          }
        }}
      />

      <Card>
        <h1 className="text-2xl font-bold mt-4 mb-4">Postavke</h1>

        <div>{String(userId) && <OnlineStatus userId={String(userId)} />}</div>

        <hr className="mb-5" />

        <Button type="danger" onClick={() => setIsDeleteModalOpen(true)}>
          Obriši svoj profil
        </Button>
      </Card>
    </AppLayout>
  );
};

export default SettingsPage;
