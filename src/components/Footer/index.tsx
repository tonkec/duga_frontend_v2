import Divider from '@app/components/Divider';
import { Link } from 'react-router';

const footerLinks = [
  { to: '/report', label: 'Prijavi problem' },
  { to: '/cookie-policy', label: 'Politika kolačića' },
  { to: '/privacy-policy', label: 'Politika privatnosti' },
  { to: '/terms-of-use', label: 'Uvjeti korištenja' },
];

const Footer = () => {
  return (
    <footer className="mt-12 pb-8 pt-6">
      <Divider className="mb-6 bg-gray-200/80" height={1} />

      <div className="flex flex-col items-center gap-5 text-center">
        <nav aria-label="Poveznice u podnožju">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-sm text-gray-500">
          Duga &#169; {new Date().getFullYear()}. Sva prava pridržana.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
