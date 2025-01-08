import { useLocalStorage } from '@uidotdev/usehooks';

interface IMessageProps {
  message: {
    message: string;
    User: {
      id: number;
    };
  };
}

const Message = ({ message }: IMessageProps) => {
  const [currentUserId] = useLocalStorage('userId');
  const isFromCurrentUser = message.User.id === Number(currentUserId);
  return (
    <div
      className={
        isFromCurrentUser
          ? 'bg-gray-200 py-2 px-4 rounded-full mb-2 max-w-[200px] text-white'
          : 'bg-gray-200 py-2 px-4 rounded-full mb-2 max-w-[200px] text-white'
      }
      style={{
        marginLeft: isFromCurrentUser ? 'auto' : '0',
        backgroundColor: isFromCurrentUser ? '#2D46B9' : '#F037A5',
      }}
    >
      <p>{message.message}</p>
    </div>
  );
};

export default Message;
