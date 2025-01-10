import Button from '../Button';

interface ICtaProps {
  title: string;
  subtitle: string;
  onClick: () => void;
  className?: string;
  buttonText: string;
}

const Cta = ({ title, subtitle, onClick, className, buttonText }: ICtaProps) => {
  return (
    <div className={`bg-blue text-white rounded px-5 py-5 ${className}`}>
      <h2 className="font-bold mb-2">{title}</h2>
      <p className="mb-4">{subtitle}</p>
      <Button className="block w-full" onClick={onClick} type="blue-dark">
        {buttonText}
      </Button>
    </div>
  );
};

export default Cta;
