import { useEffect, useState } from 'react';
import { BiError } from 'react-icons/bi';

interface IFieldErrorProps {
  message: string;
  className?: string;
  isSelfRemoving?: boolean;
}

const defaultStyles =
  'bg-red mb-1 mt-2 block px-4 py-2 text-white rounded flex items-center justify-between gap-2';

const disappearAfter = 4000;

const FieldError = ({ message, className, isSelfRemoving }: IFieldErrorProps) => {
  const [displayMessage, setDisplayMessage] = useState(message);

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
    <span className={`${defaultStyles} ${className}`}>
      <span>{message}</span> <BiError fontSize={20} />
    </span>
  );
};

export default FieldError;
