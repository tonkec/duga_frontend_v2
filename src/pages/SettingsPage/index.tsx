import AppLayout from '@app/components/AppLayout';
import Button from '@app/components/Button';
import ConfirmModal from '@app/components/ConfirmModal';
import { useState } from 'react';
import { useDeleteUser } from '../EditMyProfilePage/hooks';
import Card from '@app/components/Card';
import OnlineStatus from '@app/components/Navigation/components/OnlineStatus';
import { useCookies } from 'react-cookie';
import { useCookieConsent } from '@app/hooks/useCookieConsent';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import UserAvatar from '@app/components/UserAvatar';

interface IDeleteProfileModalProp {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteProfileModal = ({ isOpen, onClose, onDelete }: IDeleteProfileModalProp) => {
  return (
    <ConfirmModal isOpen={isOpen} onClose={onClose} onConfirm={onDelete}>
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold mb-2">Obrisati profil?</h2>
        <p className="text-gray-600">
          Brisanje profila briše sve tvoje fotografije, komentare, lajkove i poruke.
        </p>
      </div>
    </ConfirmModal>
  );
};

const SettingsSection = ({
  title,
  subtitle,
  children,
  danger = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <section
    className={`rounded-2xl border p-5 shadow-sm ${
      danger ? 'border-red/40 bg-red/5' : 'border-[#dce4ff] bg-white'
    }`}
  >
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-gray-600">{subtitle}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  </section>
);

const SettingsPage = () => {
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const userId = currentUser?.data?.id;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { deleteUserMutation } = useDeleteUser();
  const { acceptCookies, rejectCookies } = useCookieConsent();
  const [cookies] = useCookies(['cookieAccepted', 'cookieRejectedAt']);
  const hasRejectedCookies = cookies.cookieRejectedAt;

  if (isUserLoading) {
    return (
      <AppLayout>
        <Card className="rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-900">Postavke</h1>
          <p>Učitavanje...</p>
        </Card>
      </AppLayout>
    );
  }

  if (!currentUser?.data) {
    return (
      <AppLayout>
        <Card className="rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-900">Postavke</h1>
          <p>Ne možemo učitati tvoje podatke. Molimo pokušaj ponovo kasnije.</p>
        </Card>
      </AppLayout>
    );
  }

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

      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Postavke</h1>
      </div>

      <div className="grid gap-5">
        <Card className="rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              color="#2D46B9"
              userId={String(userId)}
              avatarFallbackName={currentUser.data.username}
              className="h-16 w-16 rounded-2xl"
              fgColor="#1f2937"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue">
                Prijavljen_a si kao
              </p>
              <h2 className="text-2xl font-bold text-gray-900">{currentUser.data.username}</h2>
            </div>
          </div>
        </Card>

        <SettingsSection
          title="Online status"
          subtitle="Upravljaj vidljivošću svog online statusa drugim korisnicima."
        >
          {String(userId) && <OnlineStatus />}
        </SettingsSection>

        <SettingsSection
          title="Kolačići"
          subtitle={
            hasRejectedCookies
              ? 'Kolačići su trenutno odbijeni.'
              : 'Kolačići su trenutno prihvaćeni.'
          }
        >
          {hasRejectedCookies ? (
            <Button type="blue" onClick={acceptCookies}>
              Prihvati kolačiće
            </Button>
          ) : (
            <Button type="transparent" onClick={rejectCookies}>
              Odbij kolačiće
            </Button>
          )}
        </SettingsSection>

        <SettingsSection
          title="Brisanje profila"
          subtitle="Ova radnja trajno uklanja tvoj profil i povezane podatke."
          danger
        >
          <Button type="danger" onClick={() => setIsDeleteModalOpen(true)}>
            Obriši profil
          </Button>
        </SettingsSection>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
