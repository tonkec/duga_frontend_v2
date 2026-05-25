import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useGetAllNotifcations,
  useMarkAllAsReadNotifications,
} from '@app/components/Navigation/hooks';
import { useSocket } from '@app/context/useSocket';
import Notification from './../Notification';
import { BiBell, BiCheckDouble } from 'react-icons/bi';

const AUTO_HIDE_DELAY_MS = 3000;

export type INotification = {
  id: number;
  userId: number;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  chatId?: number | null;
  actionId: number | null;
  actionType: 'upload' | 'comment' | 'message' | 'forum_question' | 'forum_answer' | null;
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
  const autoHideTimeoutRef = useRef<number | null>(null);
  const { allNotifications } = useGetAllNotifcations();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [open, setOpen] = useState(false);
  const { mutateMarkAllAsRead } = useMarkAllAsReadNotifications();

  const clearAutoHideTimeout = useCallback(() => {
    if (autoHideTimeoutRef.current) {
      window.clearTimeout(autoHideTimeoutRef.current);
      autoHideTimeoutRef.current = null;
    }
  }, []);

  const closeDropdown = useCallback(() => {
    clearAutoHideTimeout();
    setOpen(false);
  }, [clearAutoHideTimeout]);

  const scheduleAutoHide = useCallback(() => {
    clearAutoHideTimeout();
    autoHideTimeoutRef.current = window.setTimeout(() => {
      closeDropdown();
    }, AUTO_HIDE_DELAY_MS);
  }, [clearAutoHideTimeout, closeDropdown]);

  const toggleDropdown = () => {
    setOpen((isOpen) => {
      const nextOpen = !isOpen;

      if (nextOpen) {
        scheduleAutoHide();
      } else {
        clearAutoHideTimeout();
      }

      return nextOpen;
    });
  };

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
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    if (!open) return;

    scheduleAutoHide();

    return clearAutoHideTimeout;
  }, [clearAutoHideTimeout, open, scheduleAutoHide]);

  if (!userId || !socket) return null;

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={
          isMobile
            ? 'relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white'
            : 'relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-white/90 transition-all hover:-translate-y-0.5 hover:bg-white/15 hover:text-white'
        }
      >
        <span>Obavijesti</span>
        <BiBell aria-hidden fontSize={20} />
        {notifications.some((n) => !n.isRead) && (
          <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white/80" />
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 overflow-hidden rounded-3xl border border-[#dce4ff] bg-white text-gray-900 shadow-2xl shadow-blue-dark/15 ${
            isMobile ? 'left-0 right-0' : 'right-0 w-96'
          }`}
        >
          <div className="bg-gradient-to-br from-white via-[#fbfcff] to-[#f0f4ff] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Obavijesti
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-950">Najnovije aktivnosti</h2>
              </div>
              <span className="rounded-full border border-[#dce4ff] bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                {notifications.length}
              </span>
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-3 py-2 text-xs font-semibold text-blue shadow-sm transition-colors hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                mutateMarkAllAsRead();
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              }}
              disabled={!notifications.some((n) => !n.isRead)}
            >
              <BiCheckDouble fontSize={18} />
              Označi sve kao pročitano
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#f0f4ff] text-blue">
                <BiBell fontSize={24} />
              </div>
              <p className="font-semibold text-gray-950">Nema obavijesti</p>
              <p className="mt-1 text-sm text-gray-600">
                Nove poruke i aktivnosti prikazat će se ovdje.
              </p>
            </div>
          ) : (
            <div className="max-h-[28rem] space-y-2 overflow-y-auto bg-[#f7f9ff] p-3">
              {notifications.map((n) => (
                <Notification key={n.id} n={n} setNotifications={setNotifications} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
