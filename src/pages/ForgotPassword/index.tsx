import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from './hooks';
import FieldError from '../../components/FieldError';
import { Link } from 'react-router';
import { BiSolidEnvelope } from 'react-icons/bi';

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
      <h1 className="text-center text-white mb-2">Zaboravljena lozinka</h1>
      <p className="text-center text-white">
        Unesite email adresu kako biste dobili link za resetiranje lozinke.
      </p>
      {hasFormError && <FieldError message={getErrorMessage(errors)} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="email"
          placeholder="Email"
          className="border-none p-2 mb-2 mt-6 w-full bg-opacity-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink focus:outline-none rounded-lg"
          icon={<BiSolidEnvelope className="mt-1" color="rgba(255,255,255,0.7)" />}
          {...register('email')}
        />
        <Button className="w-full mt-2 py-4 rounded-xl" type="primary">
          Pošalji link za resetiranje lozinke
        </Button>

        <div className="flex justify-center mt-4 text-white gap-2">
          <p>Ipak se sjećaš? </p>
          <Link to="/login" className="text-center text-white block underline">
            Ulogiraj se!
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
