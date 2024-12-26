import AppContainer from '../AppContainer';
import Footer from '../Footer';
import Navigation from '../Navigation';

interface IAppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: IAppLayoutProps) => {
  return (
    <>
      <Navigation />
      <AppContainer>
        <main className="mt-10">{children}</main>
        <Footer />
      </AppContainer>
    </>
  );
};

export default AppLayout;
