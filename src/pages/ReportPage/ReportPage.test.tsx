import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportPage from '.';
import { submitProblemReport } from '@app/api/reports';

jest.mock('@app/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@app/api/reports', () => ({
  submitProblemReport: jest.fn(),
}));

jest.mock('react-select', () => ({
  __esModule: true,
  default: ({
    onChange,
    options,
    placeholder,
  }: {
    onChange: (option: { value: string; label: string } | null) => void;
    options: Array<{ value: string; label: string }>;
    placeholder: string;
  }) => (
    <select
      aria-label={placeholder}
      defaultValue=""
      onChange={(event) =>
        onChange(options.find((option) => option.value === event.target.value) ?? null)
      }
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const mockSubmitProblemReport = jest.mocked(submitProblemReport);

const renderReportPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ReportPage />
    </QueryClientProvider>
  );
};

describe('ReportPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits reports through the backend report API', async () => {
    mockSubmitProblemReport.mockResolvedValue({ data: { ok: true } } as Awaited<
      ReturnType<typeof submitProblemReport>
    >);

    renderReportPage();

    fireEvent.change(screen.getByLabelText('Odaberi vrstu problema'), {
      target: { value: 'abuse' },
    });
    fireEvent.change(screen.getByPlaceholderText('Opiši problem što detaljnije...'), {
      target: { value: 'Korisnik šalje uznemirujuće poruke.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Pošalji prijavu' }));

    await waitFor(() =>
      expect(mockSubmitProblemReport).toHaveBeenCalledWith({
        problemType: 'abuse',
        message: 'Korisnik šalje uznemirujuće poruke.',
      })
    );
    expect(await screen.findByText('Hvala! Tvoja prijava je poslana.')).toBeVisible();
  });

  it('shows a rate limit message when the backend rejects too many reports', async () => {
    mockSubmitProblemReport.mockRejectedValue({ response: { status: 429 } });

    renderReportPage();

    fireEvent.change(screen.getByLabelText('Odaberi vrstu problema'), {
      target: { value: 'bug' },
    });
    fireEvent.change(screen.getByPlaceholderText('Opiši problem što detaljnije...'), {
      target: { value: 'Stranica javlja grešku kod spremanja profila.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Pošalji prijavu' }));

    expect(
      await screen.findByText('Previše prijava u kratkom vremenu. Pokušaj ponovno malo kasnije.')
    ).toBeVisible();
  });
});
