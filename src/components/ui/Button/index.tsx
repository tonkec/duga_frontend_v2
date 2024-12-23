interface IButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const buttonStyles = `bg-pink text-white hover:bg-pink-dark text-white font-bold py-2 px-4 rounded`;

const Button = ({ children, onClick, className }: IButtonProps) => {
  return (
    <button className={`${buttonStyles} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
