import Card from '../Card';
import LatestUpload from './components/LatestUpload';
import { useGetLatestUploads } from './hooks';
import NotFoundSvg from '../../assets/not_found.svg';

interface IUpload {
  id: string;
  url: string;
  userId: string;
}

const LatestUploads = () => {
  const { latestUploads } = useGetLatestUploads();

  if (!latestUploads) {
    return <img src={NotFoundSvg} alt="Not found" />;
  }

  return (
    <div className="mt-8">
      <h2 className="mb-2">📸 Nedavno dodane fotke</h2>

      <Card>
        <div className="grid grid-cols-3 gap-6">
          {latestUploads?.data.map((upload: IUpload) => (
            <LatestUpload key={upload.id} upload={upload} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LatestUploads;
