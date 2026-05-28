import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@app/components/Input';
import { useUpdateUser } from '../hooks/useUpdatePostLogin';
import Button from '@app/components/Button';
import FieldError from '@app/components/FieldError';

const MAX_AGE = 110;

const Schema = z.object({
  username: z
    .string()
    .min(3, 'Korisničko ime mora imati barem 3 znaka.')
    .max(32, 'Korisničko ime može imati najviše 32 znaka.')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Dopuštena su slova, brojevi, _ i .'),
  age: z.coerce
    .number({ invalid_type_error: 'Unesi svoju dob brojem.' })
    .int('Dob mora biti cijeli broj.')
    .min(18, 'Moraš imati najmanje 18 godina.')
    .max(MAX_AGE, `Dob ne može biti veća od ${MAX_AGE} godina.`),
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

  const onSubmit = (data: FormValues) => {
    updatePostLoginMutation(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-bold text-gray-800">
          Korisničko ime
        </label>

        <Input
          type="text"
          className="!rounded-2xl !border-[#dce4ff] px-4 py-3 text-base shadow-sm focus:!border-blue"
          placeholder="npr. jazavac123"
          {...register('username')}
        />
        {errors.username && (
          <FieldError className="!rounded-xl !py-2 text-sm" message={errors.username.message} />
        )}
      </div>

      <div>
        <label htmlFor="age" className="mb-2 block text-sm font-bold text-gray-800">
          Dob
        </label>
        <Input
          type="number"
          min={18}
          max={MAX_AGE}
          className="!rounded-2xl !border-[#dce4ff] px-4 py-3 text-base shadow-sm focus:!border-blue"
          placeholder="18+"
          {...register('age')}
        />
        {errors.age && (
          <FieldError className="!rounded-xl !py-2 text-sm" message={errors.age.message} />
        )}
      </div>

      <div className="post-login-consent space-y-3 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 rounded border-[#dce4ff] accent-blue"
            {...register('acceptPrivacy')}
          />
          <span>
            Prihvaćam{' '}
            <a href="/privacy-policy" className="font-semibold text-blue underline">
              Politiku privatnosti
            </a>
          </span>
        </label>
        {errors.acceptPrivacy && (
          <FieldError
            className="!rounded-xl !py-2 text-sm"
            message={errors.acceptPrivacy.message}
          />
        )}

        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 rounded border-[#dce4ff] accent-blue"
            {...register('acceptTerms')}
          />
          <span>
            Prihvaćam{' '}
            <a href="/terms-of-use" className="font-semibold text-blue underline">
              Pravila upotrebe
            </a>
          </span>
        </label>
        {errors.acceptTerms && (
          <FieldError className="!rounded-xl !py-2 text-sm" message={errors.acceptTerms.message} />
        )}
      </div>

      <Button
        htmlType="submit"
        type="primary"
        disabled={isSubmitting || !isValid || isUpdateUserPending}
        className="post-login-submit w-full !rounded-full !py-4 text-base font-bold shadow-lg"
      >
        {isUpdateUserPending ? 'Spremam...' : 'Nastavi'}
      </Button>
    </form>
  );
}
