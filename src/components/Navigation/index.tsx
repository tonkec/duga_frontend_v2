import { useState, useEffect } from 'react';
import { FiMenu, FiSidebar, FiX } from 'react-icons/fi';
import { BiBell } from 'react-icons/bi';
import Loader from '@app/components/Loader';
import { useAuth0 } from '@auth0/auth0-react';
import { useWindowSize } from '@uidotdev/usehooks';
import { Link } from 'react-router-dom';
import { NavigationItems } from '../NavigationLinks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useSocket } from '@app/context/useSocket';
import { setOfflineStatus } from '@app/utils/setOfflineStatus';
import { clearAppSessionId, clearAppSessionRevoked } from '@app/api/appSession';
import { useGetAllNotifcations } from './hooks';
import NotificationDropdown from './components/Notifications';
import UserAvatar from '../UserAvatar';

type NotificationSummary = {
  isRead: boolean;
};

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width! < 1000;
  const { logout } = useAuth0();
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const userId = currentUser?.data?.id;
  const username = currentUser?.data?.username || 'Korisnik';
  const { allNotifications } = useGetAllNotifcations();
  const unreadNotificationsCount = ((allNotifications?.data ?? []) as NotificationSummary[]).filter(
    (notification) => !notification.isRead
  ).length;
  const hasUnreadNotifications = unreadNotificationsCount > 0;

  useEffect(() => {
    const notificationTitlePrefix = /^\(\d+\)\s+/;
    const titleWithoutNotificationCount = document.title.replace(notificationTitlePrefix, '');

    document.title = hasUnreadNotifications
      ? `(${unreadNotificationsCount}) ${titleWithoutNotificationCount}`
      : titleWithoutNotificationCount;
  }, [hasUnreadNotifications, unreadNotificationsCount]);

  useEffect(
    () => () => {
      document.title = document.title.replace(/^\(\d+\)\s+/, '');
    },
    []
  );

  const socket = useSocket();

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('duga:sidebar-visibility', { detail: isSidebarHidden }));
  }, [isSidebarHidden]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  const onLogout = async () => {
    if (socket) {
      await setOfflineStatus(socket);
    }
    clearAppSessionId();
    clearAppSessionRevoked();
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  if (isUserLoading) return <Loader />;

  return (
    <>
      {!isMobile && (
        <>
          <button
            type="button"
            onClick={() => setIsSidebarHidden((isHidden) => !isHidden)}
            className="desktop-sidebar-toggle fixed left-4 top-4 z-50 rounded-full border border-[#dce4ff] bg-white p-3 text-blue shadow-lg shadow-blue-dark/10 transition-colors hover:bg-[#eef3ff]"
            aria-label={isSidebarHidden ? 'Prikaži navigaciju' : 'Sakrij navigaciju'}
            aria-expanded={!isSidebarHidden}
          >
            <FiSidebar size={20} />
          </button>
          <aside
            className={`gradient fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/15 p-4 pt-24 text-white shadow-2xl shadow-blue-dark/10 transition-all duration-300 ease-in-out ${
              isSidebarHidden
                ? 'pointer-events-none -translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
            aria-hidden={isSidebarHidden}
          >
            <div className="mb-6 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">Duga 🌈</p>
              <p className="mt-1 text-xl font-bold text-white">Navigacija</p>
            </div>
            <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pr-1">
              <NavigationItems userId={userId} isSidebar onLogout={onLogout} />
            </nav>
          </aside>
          <div
            className={`desktop-topbar absolute right-10 top-4 z-50 flex items-center justify-between gap-4 rounded-full border border-[#dce4ff] bg-white/90 px-4 py-2 text-gray-900 shadow-lg shadow-blue-dark/10 backdrop-blur-md transition-all duration-300 ease-in-out ${
              isSidebarHidden ? 'left-20' : 'left-72'
            }`}
          >
            <span className="text-lg font-bold tracking-wide">Duga 🌈</span>
            <div className="flex items-center gap-3">
              <NotificationDropdown userId={userId ? Number(userId) : null} isMobile={false} />
              <Link to="/profile" aria-label="Otvori profil">
                <UserAvatar
                  color="#eef3ff"
                  fgColor="#2D46B9"
                  userId={userId ? String(userId) : undefined}
                  avatarFallbackName={username}
                  className="h-10 w-10 rounded-full border border-white/20"
                />
              </Link>
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <div className="gradient sticky top-0 z-40 p-3 text-white shadow-sm">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg shadow-blue-dark/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Link to="/profile" aria-label="Otvori profil">
                <UserAvatar
                  color="#eef3ff"
                  fgColor="#2D46B9"
                  userId={userId ? String(userId) : undefined}
                  avatarFallbackName={username}
                  className="h-9 w-9 rounded-full border border-white/20"
                />
              </Link>
              <Link
                to="/notifications"
                className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span>Obavijesti</span>
                <BiBell aria-hidden fontSize={20} />
                {hasUnreadNotifications && (
                  <span className="h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white/80" />
                )}
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="relative rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25"
                aria-label="Otvori navigaciju"
              >
                <FiMenu size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="gradient relative flex h-dvh w-[min(86vw,360px)] flex-col overflow-hidden p-5 text-white shadow-2xl">
            <div className="mb-8 shrink-0 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Navigacija</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25"
                  aria-label="Zatvori navigaciju"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pr-1">
              <NavigationItems
                userId={userId}
                isMobile
                onItemClick={() => setIsMobileMenuOpen(false)}
                onLogout={onLogout}
              />
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navigation;
