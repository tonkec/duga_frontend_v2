interface IAppContainerProps {
  children: React.ReactNode;
}

const AppContainer = ({ children }: IAppContainerProps) => {
  return <div className="max-w-[1400px] mx-auto">{children}</div>;
};

export default AppContainer;
