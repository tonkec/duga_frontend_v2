interface ICardProps {
  children: React.ReactNode;
  className?: string;
}

const defaultCardStyles = 'bg-white rounded-lg shadow-sm p-6';
const Card = ({ children, className }: ICardProps) => {
  return <div className={`${className} ${defaultCardStyles}`}>{children}</div>;
};

export default Card;
