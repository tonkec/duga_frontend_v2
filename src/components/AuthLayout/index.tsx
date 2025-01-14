import AuthLogo from '../AuthLogo';

interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayoutProps) => {
  return (
    <div className="lg:flex h-screen px-4">
      <div className="flex flex-col items-center justify-center w-full h-full flex-1 pt-5 px-5 xl:max-w-[500px]">
        <div className="bg-blue rounded-lg px-5 py-10">
          <div className="mx-auto w-[400px]">
            <h1 className="text-white text-6xl text-center mb-6">Duga</h1>
            <h3 className="text-white text-center">Upoznaj zanimljive queer osobe s Balkana.</h3>
          </div>
          <div className="mt-10 w-[300px] mx-auto">{children}</div>
        </div>
      </div>
      <div className="p-4 hidden lg:flex flex-1 self-center">
        <AuthLogo />
      </div>
    </div>
  );
};

export default AuthLayout;
