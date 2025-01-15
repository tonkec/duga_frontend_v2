import { Link } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginUser } from './hooks';
import FieldError from '../../components/FieldError';

type Inputs = {
  email: string;
  password: string;
};

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const getErrorMessage = (errors: FieldErrors<Inputs>) => {
  let errorMessage = '';
  if (errors.password) {
    errorMessage += 'Lozinka je neispravna.';
  }

  if (errors.email) {
    errorMessage += ' Email je neispravan.';
  }

  return errorMessage;
};

const LoginPage = () => {
  const { loginUser } = useLoginUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (isValid) {
      loginUser(data);
    }
  };

  const hasFormError = errors.password || errors.email;

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-center text-white mb-6">Ulogiraj se!</h1>
        {process.env.NODE_ENV === 'staging' && (
          <div className="bg-green p-4 rounded">
            <p className="text-white text-center">demo1023@admin.app</p>
            <p className="text-white text-center">10233470</p>
          </div>
        )}
        {hasFormError && <FieldError message={getErrorMessage(errors)} />}
        <Input
          type="email"
          placeholder="Email"
          className="mb-2 mt-2"
          {...register('email', { required: true })}
        />
        <Input
          type="password"
          placeholder="Lozinka"
          {...register('password', { required: true })}
        />
        <Button className="w-full mt-2" type="primary">
          Ulogiraj se
        </Button>
        <div className="flex flex-col mt-2 justify-center gap-1">
          <Link to="/signup" className="text-center text-white block mt-2 underline">
            Registriraj se!
          </Link>

          <Link to="/forgot-password" className="text-center text-white block mt-2 underline">
            Zaboravljena lozinka?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
