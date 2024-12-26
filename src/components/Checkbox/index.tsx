interface ICheckboxProps {
  className?: string;
}

const Checkbox = ({ className }: ICheckboxProps) => {
  return <input type="checkbox" className={className} />;
};

export default Checkbox;
