import { useEffect, useState } from 'react';
import { useUserOnlineStatus } from '@app/context/OnlineStatus/hooks';

import { useSocket } from '@app/context/useSocket';

const StatusDropdown = ({ userId }: { userId: number | null }) => {
  const socket = useSocket();
  const { data, isLoading } = useUserOnlineStatus(String(userId));

  const [status, setStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    if (data?.status) {
      setStatus(data.status);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'online' | 'offline';

    if (!['online', 'offline'].includes(newStatus)) {
      throw new Error(`Unexpected status "${newStatus}"`);
    }

    setStatus(newStatus);
    socket.emit('set-status', { userId, status: newStatus });
  };

  if (isLoading) return null;

  return (
    <select
      value={status}
      onChange={handleChange}
      className="py-2 bg-transparent text-white focus:outline-none"
    >
      <option value="online">Online 🟢</option>
      <option value="offline">Offline 🔴</option>
    </select>
  );
};

export default StatusDropdown;
