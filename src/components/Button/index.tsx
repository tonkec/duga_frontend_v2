import { SyntheticEvent } from 'react';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'icon'
  | 'black'
  | 'blue'
  | 'danger'
  | 'blue-dark'
  | 'transparent';

interface IButtonProps {
  children: React.ReactNode;
  onClick?: (e?: SyntheticEvent) => void;
  className?: string;
  type: ButtonType;
  htmlType?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const defaultStyles = `rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`;

const getBackgroundColor = (type: IButtonProps['type']) => {
  switch (type) {
    case 'primary':
      return 'py-2 px-4 bg-blue hover:bg-blue-dark text-white';
    case 'secondary':
      return 'py-2 px-4 bg-white hover:bg-blue-dark text-black hover:text-white';
    case 'tertiary':
      return 'py-2 px-4 bg-[#f0f4ff] hover:bg-[#dce4ff] text-black hover:text-black';
    case 'icon':
      return 'px-0';
    case 'black':
      return 'py-2 px-4 bg-black text-white hover:bg-gray-800';
    case 'blue':
      return 'py-2 px-4 bg-blue text-white hover:bg-blue-dark';
    case 'danger':
      return 'py-2 px-4 border border-red/30 bg-red/10 text-red hover:bg-red hover:text-white';
    case 'blue-dark':
      return 'py-2 px-4 bg-blue-dark text-white';
    case 'transparent':
      return 'py-2 px-4 bg-transparent text-black hover:bg-gray-200 underline hover:text-black';
    default:
      return 'bg-blue';
  }
};

const Button = ({
  children,
  onClick,
  className,
  type,
  htmlType,
  disabled,
  ...props
}: IButtonProps) => {
  const bgColor = getBackgroundColor(type);
  return (
    <button
      {...props}
      type={htmlType}
      disabled={disabled}
      className={`${defaultStyles} ${bgColor} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
