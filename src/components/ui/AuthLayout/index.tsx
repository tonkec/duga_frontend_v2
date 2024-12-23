interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayoutProps) => {
  return <div className="flex items-center justify-center h-screen">{children}</div>;
};

export default AuthLayout;
