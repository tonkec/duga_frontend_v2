import { useNavigate } from 'react-router';
import { useMarkAsReadNotification } from '../../hooks';
import { INotification } from '../Notifications';

interface INotificationProps {
  n: INotification;
  isMobile: boolean;
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
}

const Notification = ({ n, isMobile, setNotifications }: INotificationProps) => {
  const { mutateMarkAsRead } = useMarkAsReadNotification();
  const navigate = useNavigate();
  console.log('Notification component rendered', n);

  return (
    <div
      className={`px-4 py-2 text-sm cursor-pointer ${n.isRead ? (isMobile ? 'bg-black text-white' : 'bg-white') : 'bg-rose hover:bg-pink'}`}
      onClick={() => {
        if (!n.isRead) {
          mutateMarkAsRead(String(n.id));
          setNotifications((prev) =>
            prev.map((notification: INotification) =>
              notification.id === n.id ? { ...notification, isRead: true } : notification
            )
          );
        }

        if (n.actionType && n.actionId) {
          switch (n.actionType) {
            case 'upload':
              navigate(`/photo/${n.actionId}`);
              break;
            case 'comment':
              navigate(`/photo/${n.actionId}`);
              break;
            case 'message':
              navigate(`/chat/${n.actionId}`);
              break;
            default:
              break;
          }
        }
      }}
    >
      <p className={isMobile ? 'text-white' : 'text-black'}> {n.content}</p>
    </div>
  );
};

export default Notification;
