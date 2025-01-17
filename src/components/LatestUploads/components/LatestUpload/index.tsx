import { useNavigate } from 'react-router';
import { REACT_APP_S3_BUCKET_URL } from '../../../../utils/consts';
import { useGetUserById } from '../../../../hooks/useGetUserById';
import { useGetAllImages } from '../../../../hooks/useGetAllImages';
import Avatar from 'react-avatar';
import { getProfilePhoto, getProfilePhotoUrl } from '../../../../utils/getProfilePhoto';

interface IUpload {
  id: string;
  url: string;
  userId: string;
}

const LatestUpload = ({ upload }: { upload: IUpload }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(upload.userId);
  const { allImages } = useGetAllImages(upload.userId);
  return (
    <div className="flex flex-col gap-1">
      <img
        className="border rounded cursor-pointer"
        src={`${REACT_APP_S3_BUCKET_URL}/${upload.url}`}
        alt={upload.id}
        onClick={() => {
          navigate(`/photo/${upload.id}`);
        }}
        style={{ maxWidth: '100%' }}
      />

      <div className="flex items-center gap-2 mt-4 mb-6 lg:mb-0">
        <Avatar
          color="#2D46B9"
          name={`${user?.data.firstName} ${user?.data.lastName}`}
          src={getProfilePhotoUrl(getProfilePhoto(allImages?.data.images))}
          size="40"
          round={true}
          onClick={() => {
            navigate(`/user/${upload.userId}`);
          }}
          className="cursor-pointer"
        />
        <p>{user?.data.firstName}</p>
      </div>
    </div>
  );
};

export default LatestUpload;
