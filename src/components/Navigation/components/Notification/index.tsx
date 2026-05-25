import { useNavigate } from 'react-router';
import { useMarkAsReadNotification } from '../../hooks';
import { INotification } from '../Notifications';
import { BiBell, BiCheckCircle, BiMessageRoundedDots } from 'react-icons/bi';

interface INotificationProps {
  n: INotification;
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
}

const Notification = ({ n, setNotifications }: INotificationProps) => {
  const { mutateMarkAsRead } = useMarkAsReadNotification();
  const navigate = useNavigate();
  const Icon =
    n.actionType === 'message' ? BiMessageRoundedDots : n.isRead ? BiCheckCircle : BiBell;

  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 text-left text-sm shadow-sm transition-all hover:-translate-y-0.5 ${
        n.isRead
          ? 'border-[#dce4ff] bg-white text-gray-700 hover:bg-white'
          : 'border-blue/30 bg-white font-semibold text-gray-950 shadow-blue/10'
      }`}
      onClick={() => {
        if (!n.isRead) {
          mutateMarkAsRead(String(n.id));
          setNotifications((prev) =>
            prev.map((notification: INotification) =>
              notification.id === n.id ? { ...notification, isRead: true } : notification
            )
          );
        }

        if (n.actionType) {
          switch (n.actionType) {
            case 'upload':
              if (n.actionId) navigate(`/photo/${n.actionId}`);
              break;
            case 'comment':
              if (n.actionId) navigate(`/photo/${n.actionId}`);
              break;
            case 'message': {
              const chatId = n.chatId ?? n.actionId;
              if (chatId) navigate(`/chat/${chatId}`);
              break;
            }
            default:
              break;
          }
        }
      }}
    >
      <span
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          n.isRead ? 'bg-[#f0f4ff] text-blue' : 'bg-blue text-white'
        }`}
      >
        <Icon fontSize={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-6">{n.content}</span>
        <span className="mt-1 block text-xs font-medium text-gray-500">
          {n.isRead ? 'Pročitano' : 'Novo'}
        </span>
      </span>
      {!n.isRead && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red" />}
    </button>
  );
};

export default Notification;
