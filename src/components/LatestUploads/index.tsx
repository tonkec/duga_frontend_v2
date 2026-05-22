import Card from '@app/components/Card';
import LatestUpload from './components/LatestUpload';
import { useGetLatestUploads } from './hooks';

interface IUpload {
  id: string;
  url: string;
  userId: string;
  securePhotoUrl: string;
}

const LatestUploads = () => {
  const { latestUploads } = useGetLatestUploads();

  if (!latestUploads?.data.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">
          Zadnje fotografije
        </p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">Nedavno dodane fotke</h2>
      </div>

      <Card className="rounded-2xl p-4 md:p-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestUploads?.data.map((upload: IUpload) => (
            <LatestUpload key={upload.id} upload={upload} />
          ))}
        </div>
      </Card>
    </section>
  );
};

export default LatestUploads;
