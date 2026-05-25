import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import Loader from '@app/components/Loader';
import { useAuth0 } from '@auth0/auth0-react';
import { useWindowSize } from '@uidotdev/usehooks';
import { NavigationItems } from '../NavigationLinks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useSocket } from '@app/context/useSocket';
import { setOfflineStatus } from '@app/utils/setOfflineStatus';
import { clearAppSessionId, clearAppSessionRevoked } from '@app/api/appSession';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width! < 1000;
  const { logout } = useAuth0();
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const userId = currentUser?.data?.id;

  const socket = useSocket();

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

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
        <nav className="gradient sticky top-0 z-40 px-4 py-3 text-white shadow-sm">
          <div className="mx-auto flex max-w-[1200px] items-center gap-4 rounded-full border border-white/15 bg-white/10 px-3 py-2 shadow-lg shadow-blue-dark/10 backdrop-blur-md">
            <NavigationItems userId={userId} onLogout={onLogout} />
          </div>
        </nav>
      )}

      {isMobile && (
        <div className="gradient sticky top-0 z-40 p-3 text-white shadow-sm">
          <div className="flex items-center justify-end rounded-3xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg shadow-blue-dark/10 backdrop-blur-md">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25"
              aria-label="Otvori navigaciju"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      )}

      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="gradient relative flex h-full w-[min(86vw,360px)] flex-col p-5 text-white shadow-2xl">
            <div className="mb-8 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
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

            <nav className="flex min-h-0 flex-1 flex-col">
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
