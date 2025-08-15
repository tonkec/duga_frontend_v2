import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { useGetImageBlob } from '../../hooks';
import UserAvatar from '@app/components/UserAvatar';
import Image from '@app/components/Image';

interface IUpload {
  id: string;
  url: string;
  userId: string;
  securePhotoUrl: string;
}

const LatestUpload = ({ upload }: { upload: IUpload }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(upload.userId);
  const { data: imageBlob } = useGetImageBlob(upload.securePhotoUrl);

  return (
    <div className="flex flex-col gap-1">
      {imageBlob && (
        <Image
          src={URL.createObjectURL(imageBlob)}
          alt={upload.id}
          className="border rounded cursor-pointer"
          onClick={() => navigate(`/photo/${upload.id}`)}
        />
      )}

      <div className="flex items-center gap-2 mt-4 mb-6 lg:mb-0">
        <UserAvatar
          color="#2D46B9"
          avatarFallbackName={`${user?.data.username}`}
          onClick={() => {
            navigate(`/user/${upload.userId}`);
          }}
          userId={upload.userId}
          className="w-6 h-6"
        />
        <p>{user?.data.username}</p>
      </div>
    </div>
  );
};

export default LatestUpload;
