import { SyntheticEvent } from 'react';

interface IAppContainerProps {
  children: React.ReactNode;
  onScroll?: (e: SyntheticEvent) => void;
}

const AppContainer = ({ children, onScroll }: IAppContainerProps) => {
  return (
    <div
      className="max-w-[1400px] mx-auto h-screen px-4"
      style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}
      onScroll={(e) => onScroll?.(e)}
    >
      {children}
    </div>
  );
};

export default AppContainer;
