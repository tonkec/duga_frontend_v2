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

  it('shows required signup field errors', async () => {
    render(<PostLoginForm />);

    const submitButton = screen.getByRole('button', { name: 'Nastavi' });
    fireEvent.submit(submitButton.closest('form') as HTMLFormElement);

    expect(await screen.findByText('Korisničko ime mora imati barem 3 znaka.')).toBeVisible();
    expect(screen.getByText('Moraš imati najmanje 18 godina.')).toBeVisible();
    expect(screen.getByText('Moraš prihvatiti Politiku privatnosti.')).toBeVisible();
    expect(screen.getByText('Moraš prihvatiti Pravila upotrebe.')).toBeVisible();
    expect(submitButton).toBeDisabled();
    expect(updatePostLoginMutation).not.toHaveBeenCalled();
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

  it('rejects ages above 110', async () => {
    render(<PostLoginForm />);

    fireEvent.change(screen.getByPlaceholderText('npr. jazavac123'), {
      target: {
        value: 'valid_user',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('18+'), {
      target: {
        value: '350',
      },
    });
    fireEvent.click(screen.getByLabelText(/Politiku privatnosti/));
    fireEvent.click(screen.getByLabelText(/Pravila upotrebe/));

    expect(await screen.findByText('Dob ne može biti veća od 110 godina.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Nastavi' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Nastavi' }));

    await waitFor(() => expect(updatePostLoginMutation).not.toHaveBeenCalled());
  });

  it('enables submit and sends signup values when the form is valid', async () => {
    render(<PostLoginForm />);

    fireEvent.change(screen.getByPlaceholderText('npr. jazavac123'), {
      target: {
        value: 'valid_user',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('18+'), {
      target: {
        value: '28',
      },
    });
    fireEvent.click(screen.getByLabelText(/Politiku privatnosti/));
    fireEvent.click(screen.getByLabelText(/Pravila upotrebe/));

    const submitButton = screen.getByRole('button', { name: 'Nastavi' });
    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(updatePostLoginMutation).toHaveBeenCalledWith({
        username: 'valid_user',
        age: 28,
        acceptPrivacy: true,
        acceptTerms: true,
      })
    );
  });
});
