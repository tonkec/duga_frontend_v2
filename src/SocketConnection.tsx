import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

export default function TestSocketConnection() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('Connected to server', isConnected);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from server', isConnected);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [isConnected]);

  return null;
}
