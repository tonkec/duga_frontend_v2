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

  if (!latestUploads) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="mb-2">📸 Nedavno dodane fotke</h2>

      <Card>
        <div className="lg:grid lg:grid-cols-3 gap-6">
          {latestUploads?.data.map((upload: IUpload) => (
            <LatestUpload key={upload.id} upload={upload} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LatestUploads;
