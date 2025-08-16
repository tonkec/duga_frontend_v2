import Divider from '@app/components/Divider';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="py-12 flex flex-col justify-end">
      <Divider className="mt-4 mb-4" height={2} />

      <a className="text-gray-400 text-center mt-2" href="mailto: admin@duga.app">
        admin@duga.app
      </a>
      <div className="text-center mt-2">
        <Link to="/cookie-policy" className="text-gray-400 underline">
          Politika kolačića
        </Link>
      </div>
      <p className="text-gray-400 text-center mt-8">
        Duga &#169; {new Date().getFullYear()}. Sva prava pridržana
      </p>
    </footer>
  );
};

export default Footer;
