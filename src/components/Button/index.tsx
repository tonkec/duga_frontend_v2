interface IButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'icon' | 'black' | 'blue' | 'danger' | 'blue-dark';
  disabled?: boolean;
}

const defaultStyles = `rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`;

const getBackgroundColor = (type: IButtonProps['type']) => {
  switch (type) {
    case 'primary':
      return 'py-2 px-4 bg-pink hover:bg-pink-dark text-white';
    case 'secondary':
      return 'py-2 px-4 bg-white hover:bg-blue-dark text-black hover:text-white';
    case 'tertiary':
      return 'py-2 px-4 bg-rose hover:bg-[rgb(245,200,230)] text-black hover:text-black';
    case 'icon':
      return 'px-0';
    case 'black':
      return 'py-2 px-4 bg-black text-white hover:bg-gray-800';
    case 'blue':
      return 'py-2 px-4 bg-blue text-white hover:bg-blue-dark';
    case 'danger':
      return 'py-2 px-4 bg-red text-white';
    case 'blue-dark':
      return 'py-2 px-4 bg-blue-dark text-white';
    default:
      return 'bg-blue';
  }
};

const Button = ({ children, onClick, className, type, disabled, ...props }: IButtonProps) => {
  const bgColor = getBackgroundColor(type);
  return (
    <button
      {...props}
      disabled={disabled}
      className={`${defaultStyles} ${bgColor} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
