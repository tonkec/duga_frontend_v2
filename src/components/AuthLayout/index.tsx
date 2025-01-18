interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 gradient">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-sm md:max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
