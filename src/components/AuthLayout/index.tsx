import Logo from '../Logo';

interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayoutProps) => {
  return (
    <>
      <Logo />
      <div className="flex items-center justify-center" style={{ height: 'calc(100% - 102px)' }}>
        {children}
      </div>
    </>
  );
};

export default AuthLayout;
