interface IButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  type: 'primary' | 'secondary' | 'tertiary';
}

const defaultStyles = `text-white font-bold py-2 px-4 rounded`;

const getBackgroundColor = (type: IButtonProps['type']) => {
  switch (type) {
    case 'primary':
      return 'bg-pink hover:bg-pink-dark';
    case 'secondary':
      return 'bg-green';
    case 'tertiary':
      return 'bg-yellow';
    default:
      return 'bg-blue';
  }
};

const Button = ({ children, onClick, className, type }: IButtonProps) => {
  const bgColor = getBackgroundColor(type);
  return (
    <button className={`${defaultStyles} ${bgColor} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
