interface IAppContainerProps {
  children: React.ReactNode;
}

const AppContainer = ({ children }: IAppContainerProps) => {
  return (
    <div
      className="max-w-[1400px] mx-auto h-screen px-4"
      style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}
    >
      {children}
    </div>
  );
};

export default AppContainer;
