import { BallTriangle } from 'react-loader-spinner';

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
      <BallTriangle color="#2D46B9" height={100} width={100} />
    </div>
  );
};

export default Loader;
