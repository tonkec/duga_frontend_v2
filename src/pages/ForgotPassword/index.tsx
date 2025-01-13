import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from './hooks';
import FieldError from '../../components/FieldError';

interface Inputs {
  email: string;
}

const schema = z.object({
  email: z.string().email(),
});

const getErrorMessage = (errors: FieldErrors<Inputs>) => {
  let errorMessage = '';

  if (errors.email) {
    errorMessage += ' Email je neispravan.';
  }

  return errorMessage;
};

const ForgotPassword = () => {
  const { mutateForgotPassword } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (isValid) {
      mutateForgotPassword(data);
    }
  };

  const hasFormError = errors.email;

  return (
    <AuthLayout>
      <h1 className="text-center text-white">Zaboravljena lozinka</h1>
      <p className="text-center text-white">
        Unesite email adresu kako biste dobili link za resetiranje lozinke.
      </p>
      {hasFormError && <FieldError message={getErrorMessage(errors)} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input type="email" placeholder="Email" className="mt-2" {...register('email')} />
        <Button className="w-full mt-2" type="primary">
          Pošalji link za resetiranje lozinke
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
