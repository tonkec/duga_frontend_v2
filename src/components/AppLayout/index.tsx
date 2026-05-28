import { SyntheticEvent, useEffect, useState } from 'react';
import AppContainer from '@app/components/AppContainer';
import Footer from '@app/components/Footer';
import Navigation from '@app/components/Navigation';
import CookieBanner from '../CookieBanner';
import UserChatsSocketSync from '@app/components/UserChatsSocketSync';

interface IAppLayoutProps {
  children: React.ReactNode;
  onScroll?: (e: SyntheticEvent) => void;
}

const AppLayout = ({ children, onScroll }: IAppLayoutProps) => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  useEffect(() => {
    const handleSidebarVisibility = (event: Event) => {
      setIsSidebarHidden(Boolean((event as CustomEvent<boolean>).detail));
    };

    window.addEventListener('duga:sidebar-visibility', handleSidebarVisibility);
    return () => window.removeEventListener('duga:sidebar-visibility', handleSidebarVisibility);
  }, []);

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
