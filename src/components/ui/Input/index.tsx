interface InputProps {
  placeholder: string;
  value: string;
  className?: string;
}

const inputStyles = `bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none leading-normal focus:border-pink`;

const Input = ({ placeholder, value, className }: InputProps) => {
  return (
    <input className={`${inputStyles} ${className}`} placeholder={placeholder} value={value} />
  );
};

export default Input;
