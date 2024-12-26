import AuthLogo from '../AuthLogo';

interface IAuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayoutProps) => {
  return (
    <div className="lg:flex h-screen">
      <div className="flex flex-col items-center justify-between w-full flex-1 bg-blue pt-5 px-5 xl:max-w-[700px]">
        <div className="mr-auto">
          <h1 className="text-white text-4xl">Duga</h1>
          <h3 className="text-white">Upoznaj zanimljive queer osobe s Balkana.</h3>
        </div>
        <div className="mb-10 mt-10">{children}</div>
      </div>
      <div className="self-end p-4">
        <AuthLogo />
      </div>
    </div>
  );
};

export default AuthLayout;
