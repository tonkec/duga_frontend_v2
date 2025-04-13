import { useState } from 'react';
import { useSocket } from '../../../../context/useSocket';

const StatusDropdown = ({ userId }: { userId: number | null }) => {
  const socket = useSocket();
  const [status, setStatus] = useState<'online' | 'offline'>('online');

  return (
    <select
      value={status}
      onChange={(e) => {
        const newStatus = e.target.value;
        if (newStatus !== 'online' && newStatus !== 'offline') {
          throw new Error(
            `Unexpected status "${e.target.value}", expected one of: online, offline`
          );
        }
        setStatus(newStatus);
        socket.emit('set-status', { userId, status: newStatus });
      }}
      className="py-2 bg-transparent text-white focus:outline-none"
    >
      <option value="online">Online 🟢</option>
      <option value="offline">Offline 🔴</option>
    </select>
  );
};

export default StatusDropdown;
