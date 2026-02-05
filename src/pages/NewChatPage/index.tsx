import AppLayout from '@app/components/AppLayout';
import { useGetAllUsers } from '@app/hooks/useGetAllUsers';
import Loader from '@app/components/Loader';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import AllUserChats from './components/AllUserChats';
import { useCookies } from 'react-cookie';

const NewChatPage = () => {
  const [cookies] = useCookies(['cookieAccepted', 'cookieRejectedAt']);
  const hasRejectedCookies = cookies.cookieRejectedAt;
  const { userChats, isUserChatsLoading } = useGetAllUserChats();

  const { isAllUsersLoading } = useGetAllUsers();
  if (isAllUsersLoading || isUserChatsLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
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
