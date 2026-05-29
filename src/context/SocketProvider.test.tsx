import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { io } from 'socket.io-client';
import { SocketProvider } from './SocketProvider';
import { useSocket } from './useSocket';
import { AppSessionContext, AppSessionStatus } from './AppSessionContext';
import { useCurrentBackendUser } from '@app/hooks/useEnsureBackendUser';
import { register } from '@app/api/auth/register';

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  useCurrentBackendUser: jest.fn(),
}));

jest.mock('@app/api/appSession', () => ({
  markSessionRevoked: jest.fn(),
}));

jest.mock('@app/api/auth/register', () => ({
  register: jest.fn(),
}));

const mockIo = jest.mocked(io);
const mockUseCurrentBackendUser = jest.mocked(useCurrentBackendUser);
const mockRegister = jest.mocked(register);

const socket = {
  id: 'socket-1',
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

const SocketProbe = () => {
  const currentSocket = useSocket();
  return <div data-testid="socket-state">{currentSocket ? 'connected' : 'disconnected'}</div>;
};

const renderSocketProvider = (status: AppSessionStatus = 'active') =>
  render(
    <AppSessionContext.Provider value={status}>
      <SocketProvider>
        <SocketProbe />
      </SocketProvider>
    </AppSessionContext.Provider>
  );

describe('SocketProvider session authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCurrentBackendUser.mockReturnValue({
      data: { id: 1, username: 'current_user' },
      isLoading: false,
    } as ReturnType<typeof useCurrentBackendUser>);
    mockIo.mockReturnValue(socket as unknown as ReturnType<typeof io>);
  });

  it('connects sockets from a read-only current-user check without registering again', async () => {
    renderSocketProvider('active');

    expect(mockUseCurrentBackendUser).toHaveBeenCalledWith({
      enabled: true,
      requireAuth0: false,
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockIo).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        withCredentials: true,
      })
    );
    expect(mockIo.mock.calls[0][1]).not.toHaveProperty('auth');
    expect(mockIo.mock.calls[0][1]).not.toHaveProperty('extraHeaders');
    expect(await screen.findByTestId('socket-state')).toHaveTextContent('connected');
  });

  it('does not resolve tokens or connect sockets before the app session is active', () => {
    renderSocketProvider('loading');

    expect(mockUseCurrentBackendUser).toHaveBeenCalledWith({
      enabled: false,
      requireAuth0: false,
    });
    expect(mockIo).not.toHaveBeenCalled();
    expect(mockRegister).not.toHaveBeenCalled();
    expect(screen.getByTestId('socket-state')).toHaveTextContent('disconnected');
  });
});
