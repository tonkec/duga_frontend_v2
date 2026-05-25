import { useWindowSize } from '@uidotdev/usehooks';
import { SyntheticEvent } from 'react';

interface IAppContainerProps {
  children: React.ReactNode;
  onScroll?: (e: SyntheticEvent) => void;
}

const AppContainer = ({ children, onScroll }: IAppContainerProps) => {
  const windowSize = useWindowSize();
  const { width } = windowSize;
  const isMobile = width! < 768;

  return (
    <div
      className="mx-auto min-h-screen max-w-[1200px] px-4"
      style={!isMobile ? { display: 'grid', gridTemplateRows: 'auto 1fr auto' } : undefined}
      onScroll={(e) => onScroll?.(e)}
    >
      {children}
    </div>
  );
};

export default AppContainer;
