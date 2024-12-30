import { Link } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateUser } from './hooks';
import FieldError from '../../components/FieldError';

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
      <form className="w-[400px]" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-center text-white">Registriraj se!</h1>
        {hasFormError && <FieldError message={getErrorMessage(errors)} />}
        <Input
          type="text"
          placeholder="Ime"
          className="mb-2 mt-2"
          {...register('firstName', { required: true })}
        />

        <Input
          type="text"
          placeholder="Prezime"
          className="mb-2 mt-2"
          {...register('lastName', { required: true })}
        />
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
          Registriraj se!
        </Button>
        <Link to="/login" className="text-center text-white block mt-2 underline">
          Ulogiraj se!
        </Link>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
