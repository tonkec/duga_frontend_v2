interface IButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'icon' | 'black';
  disabled?: boolean;
}

const defaultStyles = `rounded text-sm`;

const getBackgroundColor = (type: IButtonProps['type']) => {
  switch (type) {
    case 'primary':
      return 'py-2 px-4 bg-pink hover:bg-pink-dark text-white';
    case 'secondary':
      return 'py-2 px-4 bg-white hover:bg-blue text-black hover:text-white';
    case 'tertiary':
      return 'py-2 px-4 bg-rose hover:bg-[rgb(245,200,230)] text-black hover:text-black';
    case 'icon':
      return 'px-0';
    case 'black':
      return 'py-2 px-4 bg-black text-white hover:bg-gray-800';
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
