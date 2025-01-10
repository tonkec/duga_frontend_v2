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
    <Card className="mt-8">
      <div className="grid grid-cols-3 gap-6">
        {latestUploads?.data.map((upload: IUpload) => (
          <LatestUpload key={upload.id} upload={upload} />
        ))}
      </div>
    </Card>
  );
};

export default LatestUploads;
