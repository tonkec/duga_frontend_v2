import { forwardRef } from 'react';

interface InputProps {
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
}

const inputStyles = `bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 pr-8 block w-full appearance-none leading-normal focus:border-pink`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          className={`${inputStyles} ${className}`}
          placeholder={placeholder}
        />
        {icon && <span className="absolute right-3 top-3">{icon}</span>}
      </div>
    );
  }
);

export default Input;
