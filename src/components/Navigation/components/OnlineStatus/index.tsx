import { useEffect, useState } from 'react';
import { useUserOnlineStatus } from '@app/context/OnlineStatus/hooks';

import { useSocket } from '@app/context/useSocket';

const StatusDropdown = () => {
  const socket = useSocket();
  const { data, isLoading } = useUserOnlineStatus();

  const [status, setStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    if (data?.status) {
      setStatus(data.status);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.value as 'online' | 'offline';

    if (!['online', 'offline'].includes(newStatus)) {
      throw new Error(`Unexpected status "${newStatus}"`);
    }

    setStatus(newStatus);
    socket.emit('set-status', { status: newStatus });
  };

  if (isLoading) return null;

  return (
    <form className="mb-6">
      <p className="mt-2 text-sm text-black mb-4">Odaberi svoj trenutni online status.</p>
      <input
        type="radio"
        name="status"
        value="online"
        id="online"
        className="mr-2"
        checked={status === 'online'}
        onChange={handleChange}
      />
      <label htmlFor="online" className="mr-4 text-sm font-medium text-black">
        Želim biti online
      </label>
      <input
        type="radio"
        name="status"
        value="offline"
        id="offline"
        className="mr-2"
        checked={status === 'offline'}
        onChange={handleChange}
      />
      <label htmlFor="offline" className="mr-4 text-sm font-medium text-black">
        Želim biti offline
      </label>
    </form>
  );
};

export default StatusDropdown;
