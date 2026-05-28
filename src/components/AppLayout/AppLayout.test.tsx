import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AppLayout from '.';

jest.mock('@app/components/AppContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@app/components/Navigation', () => ({
  __esModule: true,
  default: () => <nav>Navigation</nav>,
}));

jest.mock('@app/components/Footer', () => ({
  __esModule: true,
  default: () => <footer>Footer</footer>,
}));

jest.mock('@app/components/CookieBanner', () => ({
  __esModule: true,
  default: () => <div>Cookie banner</div>,
}));

jest.mock('@app/components/UserChatsSocketSync', () => ({
  __esModule: true,
  default: () => null,
}));

describe('AppLayout', () => {
  it('renders layout content without checking Auth0 state', () => {
    render(
      <AppLayout>
        <h1>Page content</h1>
      </AppLayout>
    );

    expect(screen.getByRole('heading', { name: 'Page content' })).toBeVisible();
    expect(screen.getByText('Navigation')).toBeVisible();
    expect(screen.getByText('Footer')).toBeVisible();
  });
});
