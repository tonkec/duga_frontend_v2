interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayoutProps) => {
  return (
    <div className="gradient flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 md:px-8">
      <div className="w-full max-w-md rounded-[2rem] border border-white/30 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
