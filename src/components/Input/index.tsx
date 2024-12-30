import { forwardRef } from 'react';

interface InputProps {
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
  type: string;
}

const inputStyles = `bg-white focus:outline-none focus:shadow-outline border border-gray-200 rounded py-2 px-4 pr-8 block w-full appearance-none leading-normal focus:border-pink`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type, className, onChange, icon, value, defaultValue, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          className={`${inputStyles} ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          type={type}
        />
        {icon && <span className="absolute right-3 top-3">{icon}</span>}
      </div>
    );
  }
);

export default Input;
