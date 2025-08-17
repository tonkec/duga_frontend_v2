import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@app/components/Input';
import { useUpdateUser } from '../hooks/useUpdatePostLogin';

const Schema = z.object({
  username: z
    .string()
    .min(3, 'Korisničko ime mora imati barem 3 znaka.')
    .max(32, 'Korisničko ime može imati najviše 32 znaka.')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Dopuštena su slova, brojevi, _ i .'),
  age: z.coerce
    .number({ invalid_type_error: 'Unesi svoju dob brojem.' })
    .int('Dob mora biti cijeli broj.')
    .min(18, 'Moraš imati najmanje 18 godina.'),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Moraš prihvatiti Politiku privatnosti.' }),
  }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Moraš prihvatiti Pravila upotrebe.' }),
  }),
});

type FormValues = z.infer<typeof Schema>;

export default function PostLoginForm() {
  const { updatePostLoginMutation, isUpdateUserPending } = useUpdateUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      age: undefined as unknown as number,
      acceptPrivacy: undefined,
      acceptTerms: undefined,
    },
  });

  const onSubmitForm = (data: FormValues) => {
    updatePostLoginMutation(data);
  };

  const onSubmit = (data: FormValues) => {
    onSubmitForm?.(data);
    console.log('FORM DATA →', data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto space-y-5 bg-white border border-gray-200 rounded-2xl p-6"
    >
      <h2 className="text-xl font-semibold">Osnovne informacije</h2>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Korisničko ime
        </label>

        <Input
          type="text"
          className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="npr. duga_user"
          {...register('username')}
        />
        {errors.username && <p className="mt-1 text-sm text-red">{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Dob
        </label>
        <Input
          type="number"
          min={18}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="18+"
          {...register('age')}
        />
        {errors.age && <p className="mt-1 text-sm text-red">{errors.age.message}</p>}
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300"
            {...register('acceptPrivacy')}
          />
          <span className="text-sm">
            Prihvaćam{' '}
            <a href="/privacy-policy" className="text-blue-600 underline">
              Politiku privatnosti
            </a>
            .
          </span>
        </label>
        {errors.acceptPrivacy && <p className="text-sm text-red">{errors.acceptPrivacy.message}</p>}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300"
            {...register('acceptTerms')}
          />
          <span className="text-sm">
            Prihvaćam{' '}
            <a href="/terms-of-use" className="text-blue-600 underline">
              Pravila upotrebe
            </a>
            .
          </span>
        </label>
        {errors.acceptTerms && <p className="text-sm text-red">{errors.acceptTerms.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid || isUpdateUserPending}
        className="inline-flex items-center justify-center rounded-lg bg-pink px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
      >
        Nastavi
      </button>
    </form>
  );
}
