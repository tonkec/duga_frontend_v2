import { useEffect } from 'react';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export const PageTitle: React.FC<LayoutProps> = ({ title, children }) => {
  useEffect(() => {
    document.title = `Duga | ${title}`;
  }, [title]);

  return <>{children}</>;
};
