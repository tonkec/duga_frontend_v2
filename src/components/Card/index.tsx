interface ICardProps {
  children: React.ReactNode;
}
const Card = ({ children }: ICardProps) => {
  return <div className="bg-white rounded-lg shadow-sm p-6 flex space-x-4">{children}</div>;
};

export default Card;
