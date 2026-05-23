import type { Socket } from 'socket.io-client';

const OFFLINE_ACK_TIMEOUT_MS = 500;

/** Emit offline status and wait for server ack (or timeout) before tearing down the session. */
export const setOfflineStatus = (socket: Socket): Promise<void> => {
  if (!socket.connected) {
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
