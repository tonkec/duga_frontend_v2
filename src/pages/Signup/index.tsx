import { Link } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateUser } from './hooks';
import FieldError from '../../components/FieldError';
import { BiSolidUser, BiSolidEnvelope, BiSolidKey } from 'react-icons/bi';

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

const getErrorMessage = (errors: FieldErrors<Inputs>) => {
  let errorMessage = '';
  if (errors.password) {
    errorMessage += 'Lozinka je neispravna.';
  }

  if (errors.email) {
    errorMessage += ' Email je neispravan.';
  }

  if (errors.firstName) {
    errorMessage += ' Ime je neispravno.';
  }

  if (errors.lastName) {
    errorMessage += ' Prezime je neispravno';
  }

  return errorMessage;
};

const SignupPage = () => {
  const { createUser } = useCreateUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (isValid) {
      createUser(data);
    }
  };

  const hasFormError = errors.firstName || errors.lastName || errors.email || errors.password;

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-center text-white mb-2">Učlani se!</h1>
        <p className="text-center text-white mb-6">Pronađi zanimljivu osobicu.</p>

        {hasFormError && <FieldError message={getErrorMessage(errors)} />}
        <Input
          type="text"
          placeholder="Ime"
          className="border-none p-2 mb-2 w-full bg-opacity-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink focus:outline-none rounded-lg"
          {...register('firstName', { required: true })}
          icon={<BiSolidUser className="mt-1" color="rgba(255,255,255,0.7)" />}
        />

        <Input
          type="text"
          placeholder="Prezime"
          className="border-none p-2 mb-2 w-full bg-opacity-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink focus:outline-none rounded-lg"
          {...register('lastName', { required: true })}
          icon={<BiSolidUser className="mt-1" color="rgba(255,255,255,0.7)" />}
        />
        <Input
          type="email"
          placeholder="Email"
          className="border-none p-2 mb-2 w-full bg-opacity-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink focus:outline-none rounded-lg"
          {...register('email', { required: true })}
          icon={<BiSolidEnvelope className="mt-1" color="rgba(255,255,255,0.7)" />}
        />
        <Input
          type="password"
          placeholder="Lozinka"
          className="border-none p-2 mb-2 w-full bg-opacity-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink focus:outline-none rounded-lg"
          icon={<BiSolidKey className="mt-1" color="rgba(255,255,255,0.7)" />}
          {...register('password', { required: true })}
        />
        <Button className="w-full mt-2 py-4 rounded-xl" type="primary">
          Registriraj se!
        </Button>
        <div className="flex text-white items-center justify-center gap-1 mt-6">
          <p>Već imaš račun?</p>
          <Link to="/login" className="text-center text-white block underline">
            Ulogiraj se!
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
