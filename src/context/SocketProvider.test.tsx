import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { io } from 'socket.io-client';
import { SocketProvider } from './SocketProvider';
import { useSocket } from './useSocket';
import { AppSessionContext, AppSessionStatus } from './AppSessionContext';
import { useCurrentBackendUser } from '@app/hooks/useEnsureBackendUser';
import { resolveAccessToken } from '@app/api/authToken';
import { getAppSessionId, SESSION_HEADER } from '@app/api/appSession';
import { register } from '@app/api/auth/register';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  useCurrentBackendUser: jest.fn(),
}));

jest.mock('@app/api/authToken', () => ({
  resolveAccessToken: jest.fn(),
}));

jest.mock('@app/api/appSession', () => ({
  getAppSessionId: jest.fn(),
  markSessionRevoked: jest.fn(),
  SESSION_HEADER: 'x-duga-session-id',
}));

jest.mock('@app/api/auth/register', () => ({
  register: jest.fn(),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockIo = jest.mocked(io);
const mockUseCurrentBackendUser = jest.mocked(useCurrentBackendUser);
const mockResolveAccessToken = jest.mocked(resolveAccessToken);
const mockGetAppSessionId = jest.mocked(getAppSessionId);
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
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as ReturnType<typeof useAuth0>);
    mockUseCurrentBackendUser.mockReturnValue({
      data: { id: 1, username: 'current_user' },
      isLoading: false,
    } as ReturnType<typeof useCurrentBackendUser>);
    mockResolveAccessToken.mockResolvedValue('backend-token');
    mockGetAppSessionId.mockReturnValue('server-session-id');
    mockIo.mockReturnValue(socket as unknown as ReturnType<typeof io>);
  });

  it('connects sockets from a read-only current-user check without registering again', async () => {
    renderSocketProvider('active');

    expect(mockUseCurrentBackendUser).toHaveBeenCalledWith({ enabled: true });
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockIo).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: expect.objectContaining({
          token: 'backend-token',
          sessionId: 'server-session-id',
          [SESSION_HEADER]: 'server-session-id',
        }),
      })
    );
    expect(await screen.findByTestId('socket-state')).toHaveTextContent('connected');
  });

  it('does not resolve tokens or connect sockets before the app session is active', () => {
    renderSocketProvider('loading');

    expect(mockUseCurrentBackendUser).toHaveBeenCalledWith({ enabled: false });
    expect(mockResolveAccessToken).not.toHaveBeenCalled();
    expect(mockIo).not.toHaveBeenCalled();
    expect(mockRegister).not.toHaveBeenCalled();
    expect(screen.getByTestId('socket-state')).toHaveTextContent('disconnected');
  });
});
