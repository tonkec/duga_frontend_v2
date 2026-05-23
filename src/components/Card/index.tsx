interface ICardProps {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
  onClick?: () => void;
}

const defaultCardStyles =
  'overflow-hidden border border-[#dce4ff] bg-[#f7f9ff] text-gray-900 shadow-sm';
const Card = ({ children, className, bgClassName = 'bg-white', onClick }: ICardProps) => {
  className = className || '';
  return (
    <div onClick={onClick} className={`${bgClassName} ${className} ${defaultCardStyles}`}>
      {children}
    </div>
  );
};

export default Card;
