import { useEffect, useState } from 'react';
import AppLayout from '@app/components/AppLayout';
import { useSocket } from '@app/context/useSocket';
import Notification from '@app/components/Navigation/components/Notification';
import type { INotification } from '@app/components/Navigation/components/Notifications';
import {
  useGetAllNotifcations,
  useMarkAllAsReadNotifications,
} from '@app/components/Navigation/hooks';
import { BiBell, BiCheckDouble } from 'react-icons/bi';

const NotificationsPage = () => {
  const socket = useSocket();
  const { allNotifications, areAllNotificationsLoading } = useGetAllNotifcations();
  const { mutateMarkAllAsRead } = useMarkAllAsReadNotifications();
  const [notifications, setNotifications] = useState<INotification[]>([]);

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

    socket.on('markAsRead', (notificationFromSocket) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationFromSocket.id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    });

    return () => {
      socket.off('new_notification');
      socket.off('markAsRead');
    };
  }, [socket]);

  const hasUnreadNotifications = notifications.some((notification) => !notification.isRead);

  return (
    <AppLayout>
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">
              Obavijesti
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Najnovije aktivnosti</h1>
          </div>
          <button
            type="button"
            className="notification-mark-all-button inline-flex w-fit items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-blue shadow-sm transition-colors hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              mutateMarkAllAsRead();
              setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, isRead: true }))
              );
            }}
            disabled={!hasUnreadNotifications}
          >
            <BiCheckDouble fontSize={18} />
            Označi sve kao pročitano
          </button>
        </div>

        {areAllNotificationsLoading ? (
          <div className="rounded-3xl border border-[#dce4ff] bg-white p-8 text-center text-gray-600">
            Učitavanje obavijesti...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-[#dce4ff] bg-white p-8 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#f0f4ff] text-blue">
              <BiBell fontSize={24} />
            </div>
            <p className="font-semibold text-gray-950">Nema obavijesti</p>
            <p className="mt-1 text-sm text-gray-600">
              Nove poruke i aktivnosti prikazat će se ovdje.
            </p>
          </div>
        ) : (
          <div className="space-y-3 rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] p-3 shadow-sm">
            {notifications.map((notification) => (
              <Notification
                key={notification.id}
                n={notification}
                setNotifications={setNotifications}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default NotificationsPage;
