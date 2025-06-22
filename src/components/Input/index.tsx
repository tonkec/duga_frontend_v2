import { forwardRef } from 'react';
import Label from '../Label';

interface InputProps {
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  type: string;
  onFocus?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  error?: string;
  label?: string | React.ReactNode;
}

const inputStyles = `bg-white focus:outline-none focus:shadow-outline border border-gray-200 rounded px-4 block w-full appearance-none leading-normal focus:border-blue`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      placeholder,
      type,
      className,
      onChange,
      icon,
      value,
      defaultValue,
      onFocus,
      onBlur,
      name,
      error,
      label,
      ...props
    },
    ref
  ) => {
    return icon ? (
      <div className="relative">
        {label && <Label>{label}</Label>}
        <input
          {...props}
          ref={ref}
          className={`${inputStyles} ${className} pl-10`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          type={type}
          onFocus={onFocus}
          onBlur={onBlur}
          name={name}
        />
        {icon && <span className="absolute left-3 top-[8px]">{icon}</span>}
        {error && <span className="text-red text-xs inline-block mb-4">{error}</span>}
      </div>
    ) : (
      <>
        {label && <Label>{label}</Label>}
        <input
          {...props}
          ref={ref}
          className={`${inputStyles} ${className} py-[5px]`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          type={type}
          onFocus={onFocus}
          onBlur={onBlur}
          name={name}
        />
        {error && <span className="text-red text-xs inline-block mb-2">{error}</span>}
      </>
    );
  }
);

export default Input;
