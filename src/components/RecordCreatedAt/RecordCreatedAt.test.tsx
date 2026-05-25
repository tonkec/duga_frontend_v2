import { render, screen } from '@testing-library/react';
import RecordCreatedAt from '.';

describe('RecordCreatedAt', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-25T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows today label for records created today', () => {
    render(<RecordCreatedAt createdAt="2026-05-25T09:05:00" />);

    expect(screen.getByText('Danas 9:05')).toBeInTheDocument();
  });

  it('shows yesterday label for records created yesterday', () => {
    render(<RecordCreatedAt createdAt="2026-05-24T22:30:00" />);

    expect(screen.getByText('Jučer 22:30')).toBeInTheDocument();
  });

  it('shows full date for older records', () => {
    render(<RecordCreatedAt createdAt="2026-05-20T08:15:00" />);

    expect(screen.getByText('20/5/2026 8:15')).toBeInTheDocument();
  });
});
