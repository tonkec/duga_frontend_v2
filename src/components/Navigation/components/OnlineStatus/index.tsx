import { useState } from 'react';
import { useSocket } from '../../../../context/useSocket';

const StatusDropdown = ({ userId }: { userId: number | null }) => {
  const socket = useSocket();
  const [status, setStatus] = useState<'online' | 'offline'>('online');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'online' | 'offline';
    setStatus(newStatus);
    socket.emit('set-status', { userId, status: newStatus });
  };

  if (!userId) return null;

  return (
    <select
      value={status}
      onChange={handleChange}
      className="py-2 bg-transparent text-white focus:outline-none"
    >
      <option value="" disabled hidden>
        Set status
      </option>
      <option value="online">Online 🟢</option>
      <option value="offline">Offline 🔴</option>
    </select>
  );
};

export default StatusDropdown;
