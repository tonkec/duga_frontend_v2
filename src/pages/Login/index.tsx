import { Link } from 'react-router';
import AuthLayout from '../../components/ui/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginUser } from './hooks';

type Inputs = {
  email: string;
  password: string;
};

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginPage = () => {
  const { loginUser } = useLoginUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    loginUser(data);
  };

  return (
    <AuthLayout>
      <form className="w-[400px]" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-center">Ulogiraj se!</h1>
        <Input
          placeholder="Email"
          className="mb-2 mt-2"
          {...register('email', { required: true })}
        />
        {errors.email && <span>Upiši ispravan email</span>}
        <Input placeholder="Lozinka" {...register('password', { required: true })} />
        {errors.password && <span>Upiši ispravnu lozinku</span>}
        <Button onClick={() => {}} className="w-full mt-2" type="primary">
          Ulogiraj se
        </Button>
        <Link to="/signup" className="text-center block mt-2 underline">
          Registriraj se!
        </Link>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
