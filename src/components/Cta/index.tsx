import Button from '@app/components/Button';

interface ICtaProps {
  title: string;
  subtitle: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  buttonClassName?: string;
  buttonText?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

const Cta = ({
  title,
  subtitle,
  onClick,
  className,
  icon,
  iconClassName,
  buttonClassName,
  buttonText,
  children,
  compact = false,
}: ICtaProps) => {
  const cardPadding = compact ? 'px-4 py-4' : 'px-5 py-5';
  const titleClassName = compact
    ? 'mb-2 text-lg font-bold tracking-tight text-gray-950'
    : 'mb-2 text-xl font-bold tracking-tight text-gray-950';
  const subtitleClassName = compact
    ? 'mb-4 text-sm leading-6 text-gray-700'
    : 'mb-5 text-sm leading-6 text-gray-700';
  const cardClassName = `relative isolate flex h-full overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#f7f9ff] ${cardPadding} text-gray-950 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${className ?? ''}`;
  const content = (
    <>
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue/10 blur-2xl" />
      <div className="relative z-10 flex h-full flex-col">
        {icon && (
          <div
            className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue/10 text-blue ${iconClassName ?? ''}`}
          >
            {icon}
          </div>
        )}
        <h2 className={titleClassName}>{title}</h2>
        <p className={subtitleClassName}>{subtitle}</p>
        <div className="mt-auto">
          {children ?? (
            <Button
              className={`inline-flex w-fit items-center justify-center rounded-full px-8 py-3 font-semibold shadow-md shadow-blue/15 ${buttonClassName ?? ''}`}
              onClick={onClick}
              type="blue"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </>
  );

  if (children) {
    return <div className={cardClassName}>{content}</div>;
  }

  return <div className={cardClassName}>{content}</div>;
};

export default Cta;
