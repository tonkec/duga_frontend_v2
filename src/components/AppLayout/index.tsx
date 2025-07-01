import { SyntheticEvent } from 'react';
import AppContainer from '@app/components/AppContainer';
import Footer from '@app/components/Footer';
import Navigation from '@app/components/Navigation';
import CookieBanner from '../CookieBanner';
import { useAuth0 } from '@auth0/auth0-react';

interface IAppLayoutProps {
  children: React.ReactNode;
  onScroll?: (e: SyntheticEvent) => void;
}

const AppLayout = ({ children, onScroll }: IAppLayoutProps) => {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return false;
  }

  return (
    <>
      <Navigation />
      <AppContainer onScroll={(e) => onScroll?.(e)}>
        <main className="mt-10">{children}</main>
        <Footer />
      </AppContainer>
      <CookieBanner />
    </>
  );
};

export default AppLayout;
