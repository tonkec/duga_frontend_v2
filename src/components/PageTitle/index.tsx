import { Helmet } from 'react-helmet';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export const PageTitle: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <>
      <Helmet>
        <title>Duga | {title}</title>
      </Helmet>
      {children}
    </>
  );
};
