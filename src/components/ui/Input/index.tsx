import { forwardRef } from 'react';

interface InputProps {
  placeholder: string;
  className?: string;
}

const inputStyles = `bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none leading-normal focus:border-pink`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, className, ...props }, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        className={`${inputStyles} ${className}`}
        placeholder={placeholder}
      />
    );
  }
);

export default Input;
