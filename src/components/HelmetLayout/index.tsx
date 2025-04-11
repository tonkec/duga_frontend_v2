import { Helmet } from 'react-helmet';
import Breadcrumb from '../Breadcrumb';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
