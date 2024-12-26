interface IDividerProps {
  width?: number;
  height?: number;
  className?: string;
}

const Divider = ({ width, height, className }: IDividerProps) => {
  return (
    <div style={{ width, height }} className={`${className} w-full bg-gray-200 rounded`}></div>
  );
};

export default Divider;
