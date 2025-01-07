import AuthLogo from '../AuthLogo';

interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayoutProps) => {
  return (
    <div className="lg:flex h-screen">
      <div className="flex flex-col items-center justify-end w-full h-full flex-1 gradient pt-5 px-5 xl:max-w-[700px]">
        <div>
          <div className="mx-auto w-[400px] mb-64">
            <h1 className="text-white text-6xl text-center mb-6">Duga</h1>
            <h3 className="text-white text-center">Upoznaj zanimljive queer osobe s Balkana.</h3>
          </div>
          <div className="mb-6 mt-10 w-[400px]">{children}</div>
        </div>
      </div>
      <div className="self-end p-4 hidden lg:flex flex-1">
        <AuthLogo />
      </div>
    </div>
  );
};

export default AuthLayout;
