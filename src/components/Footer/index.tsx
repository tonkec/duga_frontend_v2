import Divider from '../Divider';

const Footer = () => {
  return (
    <footer className="py-12 flex flex-col justify-end">
      <Divider className="mt-4 mb-4" height={2} />
      <a className="text-gray-400 text-center block underline cursor-pointer">
        Kodiraš? Pomozi nam unaprijediti aplikaciju
      </a>
      <p className="text-gray-400 text-center mt-6">Duga. Sva prava pridržana</p>
    </footer>
  );
};

export default Footer;
