import { Link } from 'react-router';

const NetworkErrorPage = () => {
  return (
    <div className="flex flex-col mx-auto items-center justify-center text-white h-full gradient">
      <h1 className="text-center mt-3">Izgleda da se server srušio.</h1>
      <Link to="/" className="underline">
        Natrag na početnu
      </Link>
    </div>
  );
};

export default NetworkErrorPage;
