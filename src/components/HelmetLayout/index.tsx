import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  title?: string;
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title = 'Duga', children }) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {children || <Outlet />}
    </>
  );
};
