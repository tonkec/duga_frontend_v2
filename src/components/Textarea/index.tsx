import { forwardRef, TextareaHTMLAttributes } from 'react';

interface ITextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder: string;
  className?: string;
}

const defaultStyles = `bg-white focus:outline-none focus:shadow-outline border border-gray-200 rounded py-2 px-4 pr-8 block w-full appearance-none leading-normal focus:border-blue`;

const TextArea = forwardRef<HTMLTextAreaElement, ITextAreaProps>(
  ({ placeholder, className, ...props }, ref) => {
    return (
      <textarea
        {...props}
        rows={6}
        className={`${defaultStyles} ${className}`}
        placeholder={placeholder}
        ref={ref}
        style={{ resize: 'none' }}
      ></textarea>
    );
  }
);

export default TextArea;
