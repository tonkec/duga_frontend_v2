import clsx from 'clsx';

type LoaderVariant = 'page' | 'inline' | 'overlay';
type LoaderSize = 'sm' | 'md' | 'lg';

interface ILoaderProps {
  className?: string;
  label?: string;
  size?: LoaderSize;
  variant?: LoaderVariant;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const dotClasses: Record<LoaderSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

const wrapperClasses: Record<LoaderVariant, string> = {
  page: 'min-h-[min(28rem,70vh)] w-full px-4 py-6',
  inline: 'h-full min-h-0 w-full p-0',
  overlay: 'fixed inset-0 z-50 bg-white/80 px-4 py-6 backdrop-blur-sm',
};

const Loader = ({
  className,
  label = 'Učitavanje...',
  size = 'md',
  variant = 'page',
}: ILoaderProps) => {
  return (
    <div
      className={clsx('flex items-center justify-center', wrapperClasses[variant], className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div
            className={clsx(
              'rounded-full border-4 border-[#dce4ff] border-t-blue shadow-sm motion-safe:animate-spin',
              sizeClasses[size]
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={clsx('rounded-full bg-blue', dotClasses[size])} />
          </div>
        </div>

        {variant !== 'inline' && <p className="text-sm font-semibold text-blue-dark">{label}</p>}
      </div>
    </div>
  );
};

export default Loader;
