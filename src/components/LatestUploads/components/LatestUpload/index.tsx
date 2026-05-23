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
  const username = user?.data.username || 'Korisnik';

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#dce4ff] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <button
        type="button"
        className="block w-full overflow-hidden bg-[#f7f9ff] text-left"
        onClick={() => navigate(`/photo/${upload.id}`)}
      >
        {imageBlob ? (
          <div
            className="aspect-[4/3] w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${URL.createObjectURL(imageBlob)})` }}
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-gray-500">
            Fotografija nije dostupna
          </div>
        )}
      </button>

      <div className="flex items-center gap-3 p-3">
        <UserAvatar
          color="#2D46B9"
          avatarFallbackName={username}
          onClick={() => {
            navigate(`/user/${upload.userId}`);
          }}
          userId={upload.userId}
          className="h-10 w-10 rounded-full"
          fgColor="#1f2937"
        />
        <button
          type="button"
          className="min-w-0 truncate font-semibold text-gray-900 hover:text-blue"
          onClick={() => navigate(`/user/${upload.userId}`)}
        >
          {username}
        </button>
      </div>
    </article>
  );
};

export default LatestUpload;
