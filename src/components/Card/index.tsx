interface ICardProps {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

const defaultCardStyles =
  'overflow-hidden border border-[#dce4ff] bg-[#f7f9ff] text-gray-900 shadow-sm';
const Card = ({
  children,
  className,
  bgClassName = 'bg-white',
  onClick,
  'data-testid': dataTestId,
}: ICardProps) => {
  className = className || '';
  return (
    <div
      onClick={onClick}
      className={`${bgClassName} ${className} ${defaultCardStyles}`}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
};

export default Card;
