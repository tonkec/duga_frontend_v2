import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import AllUserChats from './components/AllUserChats';
import { useCookies } from 'react-cookie';
import { useSocket } from '@app/context/useSocket';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';

const NewChatPage = () => {
  const socket = useSocket();

  const [cookies] = useCookies(['cookieAccepted', 'cookieRejectedAt']);
  const hasRejectedCookies = cookies.cookieRejectedAt;
  const { userChats, isUserChatsLoading, refetchUserChats } = useGetAllUserChats();

  useEffect(() => {
    socket.on('chatCreated', () => {
      refetchUserChats();
    });

    return () => {
      socket.off('chatCreated');
    };
  }, [socket, refetchUserChats]);

  useEffect(() => {
    socket.on('chatDeleted', () => {
      toast.info('Razgovor je obrisan', toastConfig);
      refetchUserChats();
    });

    return () => {
      socket.off('chatDeleted');
    };
  }, [socket, refetchUserChats]);

  if (isUserChatsLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (userChats?.data.length === 0 || !userChats?.data) {
    return (
      <AppLayout>
        <div className="text-center mt-10 text-gray-500">
          Još nisi započeo_la nijedan razgovor. Počni tako da posjetiš nečiji profil i pošalješ
          poruku! 😊
        </div>
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
