import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { useGetImageBlob } from '../../hooks';
import UserAvatar from '@app/components/UserAvatar';
import { BiImage } from 'react-icons/bi';

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
    <article className="group overflow-hidden rounded-3xl border border-[#dce4ff] bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        className="relative block w-full overflow-hidden rounded-2xl bg-[#f7f9ff] text-left"
        onClick={() => navigate(`/photo/${upload.id}`)}
      >
        {imageBlob ? (
          <div
            className="aspect-[4/3] w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${URL.createObjectURL(imageBlob)})` }}
          />
        ) : (
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-sm text-gray-500">
            <BiImage size={30} className="text-blue" />
            <span>Fotografija nije dostupna</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-dark shadow-sm backdrop-blur">
          Nova fotka
        </span>
      </button>

      <div className="flex items-center gap-3 px-1 pt-4">
        <UserAvatar
          color="#eef3ff"
          avatarFallbackName={username}
          onClick={() => {
            navigate(`/user/${upload.userId}`);
          }}
          userId={upload.userId}
          className="h-11 w-11 rounded-full"
          fgColor="#1f2937"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">Dodao_la</p>
          <button
            type="button"
            className="block min-w-0 truncate text-left font-bold text-gray-950 hover:text-blue"
            onClick={() => navigate(`/user/${upload.userId}`)}
          >
            {username}
          </button>
        </div>
      </div>
    </article>
  );
};

export default LatestUpload;
