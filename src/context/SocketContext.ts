import { createContext } from 'react';
import { Socket } from 'socket.io-client';
type SocketType = Socket | null;
export const SocketContext = createContext<SocketType>(null);
