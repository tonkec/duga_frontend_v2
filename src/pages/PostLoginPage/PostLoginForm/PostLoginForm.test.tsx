import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PostLoginForm from '.';

const updatePostLoginMutation = jest.fn();

jest.mock('../hooks/useUpdatePostLogin', () => ({
  useUpdateUser: () => ({
    updatePostLoginMutation,
    isUpdateUserPending: false,
  }),
}));

describe('PostLoginForm integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows signup validation errors and does not submit invalid values', async () => {
    render(<PostLoginForm />);

    fireEvent.change(screen.getByPlaceholderText('npr. jazavac123'), {
      target: {
        value: 'ab!',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('18+'), {
      target: {
        value: '17',
      },
    });

    expect(await screen.findByText('Dopuštena su slova, brojevi, _ i .')).toBeVisible();
    expect(screen.getByText('Moraš imati najmanje 18 godina.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Nastavi' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Nastavi' }));

    await waitFor(() => expect(updatePostLoginMutation).not.toHaveBeenCalled());
  });
});
