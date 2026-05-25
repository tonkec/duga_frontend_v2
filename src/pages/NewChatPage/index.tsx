import { useMemo, useState } from 'react';
import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import Button from '@app/components/Button';
import { PageTitle } from '@app/components/PageTitle';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import { filterChatsWithMessages } from '@app/utils/filterChatsWithMessages';
import AllUserChats, { IChat } from './components/AllUserChats';
import { useCookies } from 'react-cookie';
import NewMessageModal from './components/NewMessageModal';

const EmptyChats = () => {
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  return (
    <>
      <section className="relative isolate mx-auto mt-8 flex min-h-[28rem] w-full max-w-4xl items-center justify-center overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff] px-6 py-14 text-center shadow-sm">
        <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-blue/10 blur-3xl" />
        <div className="absolute -right-16 bottom-6 h-48 w-48 rounded-full bg-blue/10 blur-3xl" />

        <div className="relative z-10 flex max-w-xl flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-md shadow-blue/10">
            <span role="img" aria-hidden>
              💬
            </span>
          </div>

          <span className="mb-3 rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
            Poruke
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Nema razgovora
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-gray-600 sm:text-base">
            Započni novi razgovor s nekim od korisnika. Pretraži profile, odaberi osobu i razgovor
            će se odmah pojaviti ovdje.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              type="blue"
              className="w-full rounded-full px-6 py-3 font-semibold shadow-lg shadow-blue/20 sm:w-auto"
              onClick={() => setIsNewMessageModalOpen(true)}
            >
              Pronađi korisnike
            </Button>
            <span className="text-xs text-gray-500">Sigurno i privatno dopisivanje</span>
          </div>
        </div>
      </section>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
      />
    </>
  );
};

const NewChatPage = () => {
  const [cookies] = useCookies(['cookieAccepted', 'cookieRejectedAt']);
  const hasRejectedCookies = cookies.cookieRejectedAt;
  const { userChats, isUserChatsLoading } = useGetAllUserChats();
  const visibleChats = useMemo(
    () => filterChatsWithMessages<IChat>(userChats?.data),
    [userChats?.data]
  );

  if (isUserChatsLoading) {
    return (
      <PageTitle title="Poruke">
        <AppLayout>
          <Loader />
        </AppLayout>
      </PageTitle>
    );
  }

  if (visibleChats.length === 0) {
    return (
      <PageTitle title="Poruke">
        <AppLayout>
          <EmptyChats />
        </AppLayout>
      </PageTitle>
    );
  }

  if (hasRejectedCookies) {
    return (
      <PageTitle title="Poruke">
        <AppLayout>
          <div className="mt-10 w-full rounded-xl border border-red/30 bg-red/10 px-6 py-5 text-center text-sm font-medium text-gray-800">
            Nije moguće slati poruke jer si odbio_la kolačiće. Ako želiš slati poruke, molimo te da
            prihvatiš kolačiće u postavkama.
          </div>
        </AppLayout>
      </PageTitle>
    );
  }

  return (
    <PageTitle title="Poruke">
      <AppLayout>{visibleChats.length > 0 && <AllUserChats userChats={visibleChats} />}</AppLayout>
    </PageTitle>
  );
};

export default NewChatPage;
