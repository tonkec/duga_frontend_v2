interface ITextAreaProps {
  placeholder: string;
  className?: string;
}

const defaultStyles = `bg-white focus:outline-none focus:shadow-outline border border-gray-200 rounded py-2 px-4 pr-8 block w-full appearance-none leading-normal focus:border-pink`;

const TextArea = ({ placeholder, className }: ITextAreaProps) => {
  return (
    <textarea
      rows={10}
      className={`${defaultStyles} ${className}`}
      placeholder={placeholder}
    ></textarea>
  );
};

export default TextArea;
