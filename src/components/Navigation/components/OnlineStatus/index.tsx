import { useEffect, useState } from 'react';
import { useUserOnlineStatus } from '@app/context/OnlineStatus/hooks';

import { useSocket } from '@app/context/useSocket';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

type OnlineStatus = 'online' | 'offline';
type OnlineStatusResponse = {
  status: OnlineStatus;
};

const StatusDropdown = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { data, isLoading } = useUserOnlineStatus();

  const [status, setStatus] = useState<OnlineStatus>('online');

  useEffect(() => {
    if (data?.status) {
      setStatus(data.status);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.value as OnlineStatus;

    if (!['online', 'offline'].includes(newStatus)) {
      throw new Error(`Unexpected status "${newStatus}"`);
    }

    if (!socket?.connected) {
      toast.error('Nije uspjelo spremanje statusa');
      return;
    }

    setStatus(newStatus);
    queryClient.setQueryData<OnlineStatusResponse>(['userOnlineStatus'], (currentStatus) => ({
      ...currentStatus,
      status: newStatus,
    }));
    socket.emit('set-status', { status: newStatus });
    toast.success(`Status je uspješno promijenjen na ${newStatus}`);
  };

  if (isLoading) return null;

  const optionClassName =
    'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue/40';
  const activeOptionClassName = 'border-blue bg-blue text-white shadow-md shadow-blue/15';
  const inactiveOptionClassName = 'border-[#dce4ff] bg-white text-gray-800';

  return (
    <form
      className="mb-6 rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#f7f9ff] p-4 shadow-sm"
      data-testid="settings-online-status-form"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">Status</p>
        <p className="mt-1 text-base font-bold text-gray-950">
          Odaberi svoj trenutni online status.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="radio"
          name="status"
          value="online"
          id="online"
          className="sr-only"
          checked={status === 'online'}
          onChange={handleChange}
          data-testid="settings-status-online"
        />
        <label
          htmlFor="online"
          className={`${optionClassName} ${
            status === 'online' ? activeOptionClassName : inactiveOptionClassName
          }`}
        >
          <span
            className={`grid h-9 w-9 place-items-center rounded-full ${
              status === 'online' ? 'bg-white/15' : 'bg-green/10'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-green shadow-[0_0_0_4px_rgba(39,174,96,0.16)]" />
          </span>
          Želim biti online
        </label>

        <input
          type="radio"
          name="status"
          value="offline"
          id="offline"
          className="sr-only"
          checked={status === 'offline'}
          onChange={handleChange}
          data-testid="settings-status-offline"
        />
        <label
          htmlFor="offline"
          className={`${optionClassName} ${
            status === 'offline' ? activeOptionClassName : inactiveOptionClassName
          }`}
        >
          <span
            className={`grid h-9 w-9 place-items-center rounded-full ${
              status === 'offline' ? 'bg-white/15' : 'bg-gray-100'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-gray-400 shadow-[0_0_0_4px_rgba(148,163,184,0.18)]" />
          </span>
          Želim biti offline
        </label>
      </div>
    </form>
  );
};

export default StatusDropdown;
