import Navigation from '../Navigation';

interface IAppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: IAppLayoutProps) => {
  return (
    <div className="bg-gray-200 h-screen">
      <Navigation />
      <main className="p-4">{children}</main>
    </div>
  );
};

export default AppLayout;
