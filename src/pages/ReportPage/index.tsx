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

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

type Option = { value: string; label: string };

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
      <h2 className="text-xl font-semibold text-center mb-6">Prijavi problem</h2>

      <Card className="max-w-lg w-full mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vrsta problema</label>
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
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary25: '#F037A5',
                        primary: 'black',
                      },
                    })}
                  />
                  {errors.problem_type && (
                    <p className="mt-1 text-sm text-red">{errors.problem_type.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poruka</label>
            <TextArea
              placeholder="Opiši problem što detaljnije…"
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('message')}
            />
            {errors.message && <p className="mt-1 text-sm text-red">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending || isSubmitting}
            className="bg-pink text-white px-4 py-2 rounded hover:bg-pink-dark"
          >
            {isPending ? 'Slanje…' : 'Pošalji'}
          </button>

          <div role="status" aria-live="polite" className="text-sm">
            {isSuccess && <p className="text-green">Hvala! Tvoja prijava je poslana.</p>}
            {isError && <p className="text-red">Nešto nije u redu. Pokušaj ponovno.</p>}
            {isError && error instanceof Error && <p className="text-red">{error.message}</p>}
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}
