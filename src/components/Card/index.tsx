interface ICardProps {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
}

const defaultCardStyles = 'rounded-lg shadow-sm p-6';
const Card = ({ children, className, bgClassName = 'bg-white' }: ICardProps) => {
  return <div className={`${bgClassName} ${className} ${defaultCardStyles}`}>{children}</div>;
};

export default Card;
