import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { useGetImageBlob } from '../../hooks';
import UserAvatar from '@app/components/UserAvatar';

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
        <div
          className="h-[400px] bg-center bg-cover bg-no-repeat cursor-pointer"
          style={{ backgroundImage: `url(${URL.createObjectURL(imageBlob)})` }}
          onClick={() => navigate(`/photo/${upload.id}`)}
        ></div>
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
