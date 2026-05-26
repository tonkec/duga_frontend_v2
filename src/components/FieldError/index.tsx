import { useEffect, useState } from 'react';
import { BiError } from 'react-icons/bi';
import { FiX } from 'react-icons/fi';

interface IFieldErrorProps {
  message?: string;
  className?: string;
  isSelfRemoving?: boolean;
}

const defaultStyles =
  'bg-red mb-1 mt-2 block px-4 py-2 text-white rounded flex items-center justify-between gap-2';

const disappearAfter = 4000;

const FieldError = ({ message = '', className, isSelfRemoving }: IFieldErrorProps) => {
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    setDisplayMessage(message);
  }, [message]);

  useEffect(() => {
    if (isSelfRemoving) {
      if (message) {
        const timer = setTimeout(() => {
          setDisplayMessage('');
        }, disappearAfter);

        return () => clearTimeout(timer);
      }
    }
  }, [message, isSelfRemoving]);

  if (!displayMessage) return null;

  return (
    <div className={`${defaultStyles} ${className}`} role="alert">
      <span>{displayMessage}</span>
      <span className="flex shrink-0 items-center gap-2">
        <BiError fontSize={20} aria-hidden />
        <button
          type="button"
          className="rounded-full p-1 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          onClick={() => setDisplayMessage('')}
          aria-label="Makni grešku"
        >
          <FiX size={16} />
        </button>
      </span>
    </div>
  );
};

export default FieldError;
