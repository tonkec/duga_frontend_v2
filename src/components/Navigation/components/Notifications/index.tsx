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
  chatId?: number | null;
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

  if (!userId || !socket) return null;

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={
          isMobile
            ? 'relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white'
            : 'relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-white/90 transition-all hover:-translate-y-0.5 hover:bg-white/15 hover:text-white'
        }
      >
        <span>Obavijesti</span>
        <span aria-hidden>🔔</span>
        {notifications.some((n) => !n.isRead) && (
          <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white/80" />
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[#dce4ff] bg-white text-gray-900 shadow-xl ${
            isMobile ? 'left-0 right-0' : 'right-0 w-80'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#eef2ff] p-3">
            <span className="font-bold">Obavijesti</span>
            <Button
              type="transparent"
              className="!px-2 !py-1 text-xs"
              onClick={() => {
                mutateMarkAllAsRead();
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              }}
            >
              Označi sve kao pročitano
            </Button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">Nema obavijesti</div>
          ) : (
            notifications.map((n) => (
              <Notification key={n.id} n={n} setNotifications={setNotifications} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
