import { SyntheticEvent } from 'react';
import AppContainer from '../AppContainer';
import Footer from '../Footer';
import Navigation from '../Navigation';

interface IAppLayoutProps {
  children: React.ReactNode;
  onScroll?: (e: SyntheticEvent) => void;
}

const AppLayout = ({ children, onScroll }: IAppLayoutProps) => {
  return (
    <>
      <Navigation />
      <AppContainer onScroll={(e) => onScroll?.(e)}>
        <main className="mt-10">{children}</main>
        <Footer />
      </AppContainer>
    </>
  );
};

export default AppLayout;
