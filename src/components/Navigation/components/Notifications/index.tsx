import { useEffect, useRef, useState } from 'react';
import { useGetAllNotifcations, useMarkAsReadNotification } from '../../hooks';
import { useSocket } from '../../../../context/useSocket';

export type Notification = {
  id: number;
  userId: number;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

const NotificationDropdown = ({ userId }: { userId: number | null }) => {
  const socket = useSocket();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { allNotifications } = useGetAllNotifcations(String(userId) || '');
  const { mutateMarkAsRead } = useMarkAsReadNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

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
    <div className="relative inline-block" ref={dropdownRef}>
      <button onClick={() => setOpen((prev) => !prev)} className="relative">
        🔔
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 w-52 bg-white shadow-xl rounded-lg z-10 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-2 text-sm border-b cursor-pointer ${n.isRead ? 'bg-white' : 'bg-rose hover:bg-pink'}`}
                onClick={() => {
                  if (!n.isRead) {
                    mutateMarkAsRead(String(n.id));
                    setNotifications((prev) =>
                      prev.map((notification) => {
                        if (notification.id === n.id) {
                          return { ...notification, isRead: true };
                        }
                        return notification;
                      })
                    );
                  }
                }}
              >
                <p className="text-black"> {n.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
