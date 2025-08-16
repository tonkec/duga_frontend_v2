import Divider from '@app/components/Divider';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="py-12 flex flex-col justify-end">
      <Divider className="mt-4 mb-4" height={2} />

      <div className="flex justify-center items-center gap-2 mt-4">
        <div className="text-center">
          <Link to="/cookie-policy" className="text-gray-400 underline">
            Politika kolačića
          </Link>
        </div>
        <div>
          <Link to="/privacy-policy" className="text-gray-400 underline">
            Politika privatnosti
          </Link>
        </div>

        <div>
          <Link to="/terms-of-use" className="text-gray-400 underline">
            Uvjeti korištenja
          </Link>
        </div>
      </div>

      <p className="text-gray-400 text-center mt-8">
        Duga &#169; {new Date().getFullYear()}. Sva prava pridržana.
      </p>
    </footer>
  );
};

export default Footer;
