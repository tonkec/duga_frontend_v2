import { useNavigate } from 'react-router';
import { useMarkAsReadNotification } from '../../hooks';
import { INotification } from '../Notifications';

interface INotificationProps {
  n: INotification;
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
}

const Notification = ({ n, setNotifications }: INotificationProps) => {
  const { mutateMarkAsRead } = useMarkAsReadNotification();
  const navigate = useNavigate();

  return (
    <div
      className={`cursor-pointer border-b border-[#eef2ff] px-4 py-3 text-sm transition-colors ${
        n.isRead ? 'bg-white hover:bg-[#f7f9ff]' : 'bg-[#f0f4ff] font-semibold hover:bg-[#dce4ff]'
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
      <p className="text-gray-900">{n.content}</p>
    </div>
  );
};

export default Notification;
