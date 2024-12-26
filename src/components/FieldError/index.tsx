interface IFieldErrorProps {
  message: string;
}

const FieldError = ({ message }: IFieldErrorProps) => {
  return <span className="bg-red mb-1 mt-2 block px-4 py-2 text-white rounded">{message}</span>;
};

export default FieldError;
