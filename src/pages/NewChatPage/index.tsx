import { useNavigate } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import Button from '@app/components/Button';
import { PageTitle } from '@app/components/PageTitle';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import AllUserChats from './components/AllUserChats';
import { useCookies } from 'react-cookie';

const EmptyChats = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col items-center py-16 text-center">
      <span className="mb-4 text-5xl" role="img" aria-hidden>
        💬
      </span>
      <h1 className="text-2xl font-bold text-gray-900">Nema razgovora</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
        Započni novu konverzaciju s nekim od korisnika — tvoji razgovori će se pojaviti ovdje.
      </p>
      <Button type="blue" className="mt-8 w-full sm:w-auto" onClick={() => navigate('/')}>
        Pronađi korisnike
      </Button>
    </div>
  );
};

const NewChatPage = () => {
  const [cookies] = useCookies(['cookieAccepted', 'cookieRejectedAt']);
  const hasRejectedCookies = cookies.cookieRejectedAt;
  const { userChats, isUserChatsLoading } = useGetAllUserChats();

  if (isUserChatsLoading) {
    return (
      <PageTitle title="Poruke">
        <AppLayout>
          <Loader />
        </AppLayout>
      </PageTitle>
    );
  }

  if (userChats?.data.length === 0 || !userChats?.data) {
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
          <div className="mt-10 w-full rounded-xl border border-red/30 bg-rose px-6 py-5 text-center text-sm font-medium text-gray-800">
            Nije moguće slati poruke jer si odbio_la kolačiće. Ako želiš slati poruke, molimo te da
            prihvatiš kolačiće u postavkama.
          </div>
        </AppLayout>
      </PageTitle>
    );
  }

  return (
    <PageTitle title="Poruke">
      <AppLayout>
        {userChats.data.length > 0 && <AllUserChats userChats={userChats.data} />}
      </AppLayout>
    </PageTitle>
  );
};

export default NewChatPage;
