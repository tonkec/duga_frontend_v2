interface IButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'icon';
}

const defaultStyles = `rounded text-sm`;

const getBackgroundColor = (type: IButtonProps['type']) => {
  switch (type) {
    case 'primary':
      return 'py-2 px-4 bg-pink hover:bg-pink-dark text-white';
    case 'secondary':
      return 'py-2 px-4 bg-white hover:bg-blue text-black hover:text-white';
    case 'tertiary':
      return 'py-2 px-4 bg-rose hover:bg-white text-black hover:text-black';
    case 'icon':
      return 'px-0';
    default:
      return 'bg-blue';
  }
};

const Button = ({ children, onClick, className, type, ...props }: IButtonProps) => {
  const bgColor = getBackgroundColor(type);
  return (
    <button {...props} className={`${defaultStyles} ${bgColor} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
