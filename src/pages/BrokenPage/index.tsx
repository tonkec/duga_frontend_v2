import AppLayout from '@app/components/AppLayout';
import { Link } from 'react-router';

const BrokenPage = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center">
        <h1>😔 Oh, ne! Nešto se potrgalo! </h1>
        <Link to="/" className="button bg-pink px-2 py-2 text-white rounded inline-block mt-4">
          Natrag na Početnu
        </Link>
      </div>
    </AppLayout>
  );
};

export default BrokenPage;
