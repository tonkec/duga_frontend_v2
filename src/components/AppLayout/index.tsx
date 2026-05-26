import { SyntheticEvent, useEffect, useState } from 'react';
import AppContainer from '@app/components/AppContainer';
import Footer from '@app/components/Footer';
import Navigation from '@app/components/Navigation';
import CookieBanner from '../CookieBanner';
import UserChatsSocketSync from '@app/components/UserChatsSocketSync';
import { useAuth0 } from '@auth0/auth0-react';

type CypressWindow = Window &
  typeof globalThis & {
    Cypress?: unknown;
    __dugaCypressAuthUser?: unknown;
  };

interface IAppLayoutProps {
  children: React.ReactNode;
  onScroll?: (e: SyntheticEvent) => void;
}

const AppLayout = ({ children, onScroll }: IAppLayoutProps) => {
  const { isAuthenticated } = useAuth0();
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const isCypressAuthenticated =
    Boolean((window as CypressWindow).Cypress) &&
    Boolean(
      (window as CypressWindow).__dugaCypressAuthUser ||
        window.localStorage.getItem('duga:cypress-auth-user')
    );

  useEffect(() => {
    const handleSidebarVisibility = (event: Event) => {
      setIsSidebarHidden(Boolean((event as CustomEvent<boolean>).detail));
    };

    window.addEventListener('duga:sidebar-visibility', handleSidebarVisibility);
    return () => window.removeEventListener('duga:sidebar-visibility', handleSidebarVisibility);
  }, []);

  if (!isAuthenticated && !isCypressAuthenticated) {
    return false;
  }

  return (
    <>
      <UserChatsSocketSync />
      <Navigation />
      <div
        className={`app-layout-content ${isSidebarHidden ? 'app-layout-content-sidebar-hidden' : ''}`}
      >
        <AppContainer onScroll={(e) => onScroll?.(e)}>
          <main className="flex-1">{children}</main>
          <Footer />
        </AppContainer>
      </div>
      <CookieBanner />
    </>
  );
};

export default AppLayout;
