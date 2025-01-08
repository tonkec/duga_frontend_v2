import AppLayout from '../../components/AppLayout';
import NotFoundPageSvg from '../../assets/not_found_page.svg';

const NotFoundPage = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <img src={NotFoundPageSvg} alt="Not Found Page" className="w-1/2 h-1/2" />
        <h1 className="text-2xl font-bold mt-4">Stranica ne postoji.</h1>
      </div>
    </AppLayout>
  );
};

export default NotFoundPage;
