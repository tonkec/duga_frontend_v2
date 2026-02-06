import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import AllUserChats from './components/AllUserChats';
import { useCookies } from 'react-cookie';

const NewChatPage = () => {
  const [cookies] = useCookies(['cookieAccepted', 'cookieRejectedAt']);
  const hasRejectedCookies = cookies.cookieRejectedAt;
  const { userChats, isUserChatsLoading } = useGetAllUserChats();

  if (isUserChatsLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (userChats?.data.length === 0 || !userChats?.data) {
    return (
      <div className="mt-10 text-center text-gray-600">
        Trenutno nemaš aktivnih razgovora. Započni novu konverzaciju kako bi se ovdje prikazale
        tvoje poruke.
      </div>
    );
  }

  if (hasRejectedCookies) {
    return (
      <AppLayout>
        <div className="text-center mt-10 text-red font-semibold">
          Nije moguće slati poruke jer si odbio_la kolačiće. Ako želiš slati poruke, molimo te da
          prihvatiš kolačiće u postavkama.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {userChats?.data.length > 0 && <AllUserChats userChats={userChats?.data} />}
    </AppLayout>
  );
};

export default NewChatPage;
