import { useSearchParams } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { FieldErrors, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FieldError from '../../components/FieldError';
import { useResetPassword, useVerifyToken } from './hooks';
import { useEffect } from 'react';

const schema = z
  .object({
    password: z.string().min(6, { message: 'Lozinka mora imati minimalno 6 znakova' }),
    repeatPassword: z.string().min(6, { message: 'Lozinka mora imati minimalno 6 znakova' }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Lozinke se ne podudaraju',
    path: ['repeatPassword'],
  });

type Inputs = {
  password: string;
  repeatPassword: string;
};

const getErrorMessage = (errors: FieldErrors<Inputs>) => {
  let errorMessage = '';
  if (errors.password) {
    errorMessage += 'Lozinka je neispravna.';
  }

  if (errors.repeatPassword) {
    errorMessage += ' Ponovljena lozinka je neispravna.';
  }

  return errorMessage;
};

const ResetPassword = () => {
  const { mutateVerifyToken, isVerifyTokenSuccess } = useVerifyToken();
  const { mutateResetPassword } = useResetPassword();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const formValues = watch();

  useEffect(() => {
    if (isVerifyTokenSuccess) {
      mutateResetPassword({ password: formValues.password, email: email || '' });
    }
  }, [isVerifyTokenSuccess, mutateResetPassword, formValues.password, email]);

  if (!token || !email) {
    return (
      <AuthLayout>
        <h1>Greška</h1>
        <p>Podaci nisu ispravni</p>
      </AuthLayout>
    );
  }

  const hasFormError = errors.password || errors.repeatPassword;

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit(() => {
          if (isValid) {
            mutateVerifyToken({ token, email });
          }
        })}
      >
        {hasFormError && <FieldError message={getErrorMessage(errors)} />}
        <Input
          type="password"
          placeholder="Nova lozinka"
          className="mb-2"
          {...register('password')}
        />
        <Input type="password" placeholder="Ponovi lozinku" {...register('repeatPassword')} />
        <Button className="w-full mt-2" type="primary">
          Resetiraj lozinku
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;