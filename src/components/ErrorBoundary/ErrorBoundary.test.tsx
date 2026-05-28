import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '.';

const BrokenChild = () => {
  throw new Error('render failed');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <h1>Content loaded</h1>
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'Content loaded' })).toBeVisible();
  });

  it('shows a recovery screen when a child crashes', () => {
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'Nešto se strgalo' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Učitaj ponovno' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Idi na početnu' })).toBeVisible();
  });
});
