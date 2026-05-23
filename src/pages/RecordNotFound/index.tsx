import notFound from '@app/assets/not_found.svg';
import AppLayout from '@app/components/AppLayout';
import Image from '@app/components/Image';

const RecordNotFound = () => {
  return (
    <AppLayout>
      <Image src={notFound} className="mx-auto block max-w-[300px] mt-12" alt="Not Found" />
      <h1 className="text-center mt-5">Ne postoji.</h1>
    </AppLayout>
  );
};

export default RecordNotFound;
