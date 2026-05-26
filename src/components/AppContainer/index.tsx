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
      className="mx-auto flex min-h-screen max-w-[1184px] flex-col px-4"
      style={!isMobile ? { width: '100%' } : undefined}
      onScroll={(e) => onScroll?.(e)}
    >
      {children}
    </div>
  );
};

export default AppContainer;
