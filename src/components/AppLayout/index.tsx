import AppContainer from '../AppContainer';
import Navigation from '../Navigation';

interface IAppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: IAppLayoutProps) => {
  return (
    <>
      {' '}
      <Navigation />
      <AppContainer>
        <div className="h-screen">
          <main className="p-4">{children}</main>
        </div>
      </AppContainer>
    </>
  );
};

export default AppLayout;
