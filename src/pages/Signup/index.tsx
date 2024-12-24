import { Link } from 'react-router';
import AuthLayout from '../../components/ui/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateUser } from './hooks';

type Inputs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

const SignupPage = () => {
  const { createUser } = useCreateUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    createUser(data);
  };
  return (
    <AuthLayout>
      <form className="w-[400px]" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-center">Prijavi se!</h1>
        <Input
          placeholder="Ime"
          className="mb-2 mt-2"
          {...register('firstName', { required: true })}
        />
        {errors.firstName && <span>Upiši ispravno ime</span>}
        <Input
          placeholder="Prezime"
          className="mb-2 mt-2"
          {...register('lastName', { required: true })}
        />
        {errors.lastName && <span>Upiši ispravno prezime</span>}
        <Input
          placeholder="Email"
          className="mb-2 mt-2"
          {...register('email', { required: true })}
        />
        {errors.password && <span>Upiši ispravni email</span>}
        <Input placeholder="Lozinka" {...register('password', { required: true })} />
        {errors.password && <span>Upiši ispravnu lozinku</span>}
        <Button onClick={() => {}} className="w-full mt-2" type="primary">
          Prijavi se
        </Button>
        <Link to="/login" className="text-center block mt-2 underline">
          Ulogiraj se!
        </Link>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
