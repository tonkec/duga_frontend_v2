import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import AppLayout from '@app/components/AppLayout';
import Card from '@app/components/Card';
import Select from 'react-select';
import TextArea from '@app/components/Textarea';
import { useLocalStorage } from '@uidotdev/usehooks';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

type Option = { value: string; label: string };

const problemOptions: Option[] = [
  { value: 'bug', label: 'Bug / tehnički problem' },
  { value: 'abuse', label: 'Zlouporaba / uznemiravanje' },
  { value: 'inappropriate', label: 'Neprimjeren sadržaj' },
  { value: 'account', label: 'Račun / pristup' },
  { value: 'billing', label: 'Plaćanje / naplata' },
  { value: 'other', label: 'Ostalo' },
];

const FormSchema = z.object({
  problem_type: z.string().min(2, 'Odaberi vrstu problema.'),
  message: z.string().min(10, 'Poruka mora imati barem 10 znakova.'),
});

type FormValues = {
  problem_type: { value: string; label: string } | null;
  message: string;
  userId: string;
};

async function sendReport(data: FormValues) {
  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { problem_type: data.problem_type, message: data.message, userId: data.userId },
    { publicKey: PUBLIC_KEY }
  );
}

export default function ReportPage() {
  const [userId] = useLocalStorage<string>('userId', '');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationKey: ['report-problem'],
    mutationFn: sendReport,
    onSuccess: () => reset(),
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    mutate({ ...data, userId });
  };

  return (
    <AppLayout>
      <h2 className="text-xl font-semibold text-center mb-6">Prijavi problem</h2>

      <Card className="max-w-lg w-full mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div>
            <label htmlFor="problem_type" className="block text-sm font-medium text-gray-700">
              Vrsta problema
            </label>

            <Controller
              name="problem_type"
              control={control}
              render={({ field }) => (
                <Select
                  options={problemOptions}
                  value={field.value}
                  onChange={(opt) => field.onChange(opt as Option | null)}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Poruka
            </label>

            <TextArea
              placeholder="Opiši problem što detaljnije…"
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('message')}
            />
            {errors.message && <p className="mt-1 text-sm text-red">{errors.message.message}</p>}
          </div>

          <button type="submit" disabled={isPending || isSubmitting}>
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
