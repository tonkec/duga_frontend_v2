import AuthLayout from '../../components/ui/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage = () => {
  return (
    <AuthLayout>
      <form className="w-[400px]">
        <h1 className="text-center">Ulogiraj se u Dugu!</h1>
        <Input placeholder="Email" value="" className="mb-4 mt-4" />
        <Input placeholder="Lozinka" value="" />
        <Button onClick={() => {}} className="w-full mt-4">
          Ulogiraj se
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
