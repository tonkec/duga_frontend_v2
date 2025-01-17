import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllUserChats } from '../../hooks/useGetAllUserChats';
import Card from '../Card';
import { IChat } from '../../pages/NewChatPage/hooks';
import { useNavigate } from 'react-router';
import RecordCreatedAt from '../RecordCreatedAt';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Avatar from 'react-avatar';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';
import { useGetUserById } from '../../hooks/useGetUserById';

interface IMessage {
  id: number;
  message: string;
  createdAt: string;
  User: {
    id: number;
    firstName: string;
  };
}

const LatestMessageAvatar = ({ userId }: { userId: string }) => {
  const { allImages } = useGetAllImages(userId);
  const { user } = useGetUserById(userId);
  return (
    <div className="flex gap-2">
      <Avatar
        color="#F037A5"
        name={`${user?.data?.firstName} ${user?.data?.lastName}`}
        src={getProfilePhotoUrl(getProfilePhoto(allImages?.data.images))}
        size="40"
        round={true}
        className="cursor-pointer"
      />
    </div>
  );
};

const LatestMessage = ({ message, onClick }: { message: IMessage; onClick: () => void }) => {
  const [userId] = useLocalStorage('userId');
  const getLatestPerson = () => {
    if (message.User.id === Number(userId)) {
      return <LatestMessageAvatar userId={String(userId)} />;
    }

    return <LatestMessageAvatar userId={String(message.User.id)} />;
  };
  return (
    <div onClick={onClick}>
      <div className="flex items-center gap-2 mb-2">
        {getLatestPerson()}
        <span> {message.message} </span> <br />
      </div>
      <RecordCreatedAt createdAt={message.createdAt} />
    </div>
  );
};

const LatestMessages = () => {
  const navigate = useNavigate();
  const numberOfChats = 4;
  const numberOfMessages = 2;
  const [userId] = useLocalStorage('userId');
  const { userChats } = useGetAllUserChats(userId as string, true);
  const latestChats = userChats?.data?.slice(0, numberOfChats);

  if (!latestChats) {
    return null;
  }

  return (
    <div className="col-span-2">
      <h2 className="mb-2"> 📬 Tvoje nedavne poruke</h2>
      <Card className="!p-0 overflow-hidden">
        {latestChats?.map((chat: IChat) =>
          chat.Messages.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
            .slice(0, numberOfMessages)
            .map((message: IMessage, index) => (
              <div
                className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer"
                key={`chat-${index}`}
              >
                <LatestMessage
                  message={message}
                  onClick={() => {
                    navigate(`/chat/${chat.id}`);
                  }}
                />
              </div>
            ))
        )}
      </Card>
    </div>
  );
};

export default LatestMessages;
