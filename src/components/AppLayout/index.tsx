import AppContainer from '../AppContainer';
import Navigation from '../Navigation';

interface IAppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: IAppLayoutProps) => {
  return (
    <>
      <Navigation />
      <AppContainer>
        <main className="p-4 mt-10">{children}</main>
      </AppContainer>
    </>
  );
};

export default AppLayout;
