import { useEffect, useRef, useState } from 'react';
import {
  useGetAllNotifcations,
  useMarkAllAsReadNotifications,
} from '@app/components/Navigation/hooks';
import { useSocket } from '@app/context/useSocket';
import Notification from './../Notification';
import Button from '@app/components/Button';

export type INotification = {
  id: number;
  userId: number;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  actionId: number | null;
  actionType: 'upload' | 'comment' | 'message' | null;
};

const NotificationDropdown = ({
  userId,
  isMobile,
}: {
  userId: number | null;
  isMobile: boolean;
}) => {
  const socket = useSocket();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { allNotifications } = useGetAllNotifcations();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [open, setOpen] = useState(false);
  const { mutateMarkAllAsRead } = useMarkAllAsReadNotifications();

  useEffect(() => {
    if (allNotifications) {
      setNotifications(allNotifications.data);
    }
  }, [allNotifications]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [userId, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('markAsRead', (notificationFromSocket) => {
      setNotifications((prev) =>
        prev.map((notification: INotification) =>
          notification.id === notificationFromSocket.id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    });

    return () => {
      socket.off('markAsRead');
    };
  }, [userId, socket, notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userId) return null;

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button onClick={() => setOpen((prev) => !prev)} className="relative w-full">
        <span
          className={
            isMobile
              ? 'hover:bg-white hover:text-black text-lg bg-black text-white w-full inline-block px-2 py-1 rounded mb-2'
              : 'text-white'
          }
        >
          Obavijesti 🔔
        </span>
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red rounded-full" />
        )}
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 mt-1 w-52 ${isMobile ? 'bg-black' : 'bg-white'} shadow-xl rounded-lg z-10 max-h-96 overflow-y-auto`}
        >
          <Button
            type="transparent"
            className="w-full text-left"
            onClick={() => {
              mutateMarkAllAsRead();
              setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            }}
          >
            Označi sve kao pročitano
          </Button>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-black">Nema obavijesti</div>
          ) : (
            notifications.map((n) => (
              <Notification
                key={n.id}
                n={n}
                isMobile={isMobile}
                setNotifications={setNotifications}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
