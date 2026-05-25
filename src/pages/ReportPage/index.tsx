import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import AppLayout from '@app/components/AppLayout';
import Card from '@app/components/Card';
import Select from 'react-select';
import TextArea from '@app/components/Textarea';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import Button from '@app/components/Button';
import FieldError from '@app/components/FieldError';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

type Option = { value: string; label: string };

const reportSelectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '3rem',
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#2D46B9' : '#dce4ff',
    boxShadow: state.isFocused ? '0 0 0 1px #2D46B9' : '0 1px 2px rgba(15, 23, 42, 0.05)',
    '&:hover': {
      borderColor: '#2D46B9',
    },
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid #dce4ff',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2D46B9' : state.isFocused ? '#f0f4ff' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    ':active': {
      backgroundColor: '#2D46B9',
      color: 'white',
    },
  }),
};

const problemOptions: Option[] = [
  { value: 'bug', label: 'Bug / tehnički problem' },
  { value: 'abuse', label: 'Zlouporaba / uznemiravanje' },
  { value: 'inappropriate', label: 'Neprimjeren sadržaj' },
  { value: 'account', label: 'Račun / pristup' },
  // { value: 'billing', label: 'Plaćanje / naplata' },
  { value: 'other', label: 'Ostalo' },
];

const FormSchema = z.object({
  problem_type: z.enum(['bug', 'abuse', 'inappropriate', 'account', 'billing', 'other'], {
    required_error: 'Odaberi vrstu problema.',
    invalid_type_error: 'Odaberi vrstu problema.',
  }),
  message: z.string().min(10, 'Poruka mora imati barem 10 znakova.'),
  userId: z.number().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

async function sendReport(data: FormValues) {
  const label =
    problemOptions.find((o) => o.value === data.problem_type)?.label ?? data.problem_type;
  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { problem_type: label, message: data.message, user_id: data.userId ?? '' },
    { publicKey: PUBLIC_KEY }
  );
}

export default function ReportPage() {
  const { user: currentUser } = useGetCurrentUser();
  const userId = currentUser?.data?.id;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationKey: ['report-problem'],
    mutationFn: sendReport,
  });

  const onSubmit = (data: FormValues) => {
    mutate({ ...data, userId });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Podrška</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Prijavi problem</h1>
          <p className="mt-2 text-gray-600">
            Opiši što se dogodilo i poslat ćemo prijavu administratorima.
          </p>
        </div>

        <Card className="rounded-2xl p-5 md:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
              <label className="mb-2 block text-sm font-bold text-gray-700">Vrsta problema</label>
              <Controller
                name="problem_type"
                control={control}
                render={({ field }) => (
                  <>
                    <Select
                      options={problemOptions}
                      value={problemOptions.find((opt) => opt.value === field.value) ?? null}
                      onChange={(opt) => field.onChange((opt as Option | null)?.value ?? '')}
                      onBlur={field.onBlur}
                      isClearable
                      styles={reportSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Odaberi vrstu problema"
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary25: '#dce4ff',
                          primary: '#2D46B9',
                        },
                      })}
                    />
                    {errors.problem_type && (
                      <FieldError
                        message={errors.problem_type.message || 'Odaberi vrstu problema.'}
                      />
                    )}
                  </>
                )}
              />
            </div>

            <div className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
              <label className="mb-2 block text-sm font-bold text-gray-700">Poruka</label>
              <TextArea
                placeholder="Opiši problem što detaljnije..."
                className="block w-full rounded-xl border-gray-200 focus:border-blue"
                {...register('message')}
              />
              {errors.message && <FieldError message={errors.message.message || 'Unesi poruku.'} />}
            </div>

            <div className="flex justify-end">
              <Button
                type="blue"
                htmlType="submit"
                disabled={isPending || isSubmitting}
                className="w-full rounded-full px-8 py-3 font-semibold shadow-md shadow-blue/15 sm:w-fit"
              >
                {isPending ? 'Slanje...' : 'Pošalji prijavu'}
              </Button>
            </div>

            <div role="status" aria-live="polite" className="text-sm">
              {isSuccess && (
                <p className="rounded-2xl bg-green/10 px-4 py-3 font-semibold text-green">
                  Hvala! Tvoja prijava je poslana.
                </p>
              )}
              {isError && (
                <p className="rounded-2xl bg-red/10 px-4 py-3 font-semibold text-red">
                  Nešto nije u redu. Pokušaj ponovno.
                </p>
              )}
              {isError && error instanceof Error && (
                <p className="mt-2 text-red">{error.message}</p>
              )}
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
