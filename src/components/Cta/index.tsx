import Button from '@app/components/Button';

interface ICtaProps {
  title: string;
  subtitle: string;
  onClick?: () => void;
  className?: string;
  buttonText?: string;
  children?: React.ReactNode;
}

const Cta = ({ title, subtitle, onClick, className, buttonText, children }: ICtaProps) => {
  const cardClassName = `flex h-full flex-col bg-[#f7f9ff] text-black border border-[#dce4ff] rounded px-5 py-5 ${className ?? ''}`;

  if (children) {
    return (
      <div className={cardClassName}>
        <h2 className="font-bold mb-2">{title}</h2>
        <p className="mb-4">{subtitle}</p>
        <div className="mt-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <h2 className="font-bold mb-2">{title}</h2>
      <p className="mb-4">{subtitle}</p>
      <Button className="mt-auto block w-full" onClick={onClick} type="blue">
        {buttonText}
      </Button>
    </div>
  );
};

export default Cta;
