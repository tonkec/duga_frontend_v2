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
  const isMobile = width! < 768;
  const { logout } = useAuth0();
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const userId = currentUser?.data?.id;

  const socket = useSocket();

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

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
        <nav className="gradient sticky top-0 z-40 py-3 text-white shadow-sm">
          <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4">
            <div className="mr-2 text-xl font-bold tracking-tight">Duga</div>
            <NavigationItems userId={userId} onLogout={onLogout} />
          </div>
        </nav>
      )}

      {isMobile && (
        <div className="gradient sticky top-0 z-40 flex items-center justify-between p-4 text-white shadow-sm">
          <div className="text-xl font-bold tracking-tight">Duga</div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
            aria-label="Otvori navigaciju"
          >
            <FiMenu size={24} />
          </button>
        </div>
      )}

      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="gradient relative flex h-full w-[min(86vw,340px)] flex-col p-5 text-white shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Navigacija</p>
                <h2 className="text-2xl font-bold">Duga</h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
                aria-label="Zatvori navigaciju"
              >
                <FiX size={22} />
              </button>
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
