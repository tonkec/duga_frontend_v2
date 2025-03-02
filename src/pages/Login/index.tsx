import { Link } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginUser } from './hooks';
import FieldError from '../../components/FieldError';
import { BiSolidEnvelope, BiSolidKey } from 'react-icons/bi';

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

const IS_STAGING = import.meta.env.STAGING;

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
        <h1 className="text-center text-white mb-2">Evo te natrag!</h1>
        <p className="text-center text-white mb-6">Pronađi zanimljivu osobicu.</p>
        {hasFormError && <FieldError message={getErrorMessage(errors)} />}
        <Input
          type="email"
          placeholder="Email"
          className="border-none p-2 mb-4 w-full bg-opacity-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink focus:outline-none rounded-lg"
          {...register('email', { required: true })}
          defaultValue={IS_STAGING ? 'demo1023@admin.app' : ''}
          icon={<BiSolidEnvelope className="mt-1" color="rgba(255,255,255,0.7)" />}
        />
        <Input
          type="password"
          placeholder="Lozinka"
          {...register('password', { required: true })}
          defaultValue={IS_STAGING ? '10233470' : ''}
          className="border-none p-2 mb-2 w-full bg-opacity-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink focus:outline-none rounded-lg"
          icon={<BiSolidKey className="mt-1" color="rgba(255,255,255,0.7)" />}
        />
        <Button className="w-full mt-2 py-4 rounded-xl" type="primary">
          Ulogiraj se
        </Button>
        <div className="flex flex-col mt-2 justify-center gap-1">
          <Link to="/forgot-password" className="text-center text-white block mt-2 underline">
            Zaboravljena lozinka?
          </Link>
          <div className="flex text-white items-center justify-center gap-1 mt-6">
            <p>Prvi puta ovdje?</p>
            <Link to="/signup" className="text-center text-white block underline">
              Registriraj se!
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
