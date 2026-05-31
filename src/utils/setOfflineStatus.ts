import type { Socket } from 'socket.io-client';

const OFFLINE_ACK_TIMEOUT_MS = 500;

type SetOfflineStatusOptions = {
  waitForAck?: boolean;
};

/** Emit offline status and optionally wait for server ack before tearing down the session. */
export const setOfflineStatus = (
  socket: Socket,
  { waitForAck = true }: SetOfflineStatusOptions = {}
): Promise<void> => {
  if (!socket.connected) {
    return Promise.resolve();
  }

  if (!waitForAck) {
    socket.emit('set-status', { status: 'offline' });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(resolve, OFFLINE_ACK_TIMEOUT_MS);

    socket.emit('set-status', { status: 'offline' }, () => {
      window.clearTimeout(timeoutId);
      resolve();
    });
  });
};
