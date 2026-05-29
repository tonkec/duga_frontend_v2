import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { useGetImageBlob } from '../../hooks';
import UserAvatar from '@app/components/UserAvatar';
import { BiImage } from 'react-icons/bi';
import { getUserProfilePath } from '@app/utils/userProfilePath';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import type { IImage } from '@app/components/Photos';

type UserWithAvatar = {
  avatar?: string | null;
  picture?: string | null;
  profilePhoto?: {
    securePhotoUrl?: string | null;
    imageUrl?: string | null;
    url?: string | null;
  } | null;
  publicId?: string;
  securePhotoUrl?: string | null;
  imageUrl?: string | null;
  url?: string | null;
};

interface IUpload {
  id: string;
  url?: string;
  userId: string;
  userPublicId?: string;
  securePhotoUrl?: string;
  User?: UserWithAvatar;
  user?: UserWithAvatar;
}

const getAvatarSource = (user: UserWithAvatar | undefined) =>
  user?.profilePhoto?.securePhotoUrl ||
  user?.profilePhoto?.imageUrl ||
  user?.profilePhoto?.url ||
  user?.securePhotoUrl ||
  user?.imageUrl ||
  user?.avatar ||
  user?.picture ||
  '';

const getProfilePhotoOverride = (user: UserWithAvatar | undefined): Partial<IImage> | undefined => {
  const avatarSource = getAvatarSource(user);

  if (!avatarSource) return undefined;

  return {
    securePhotoUrl: avatarSource,
    imageUrl: avatarSource,
    url: avatarSource,
  };
};

const LatestUpload = ({ upload }: { upload: IUpload }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(upload.userId);
  const { allImages } = useGetAllImages(upload.userId);
  const { data: imageBlob } = useGetImageBlob(upload.securePhotoUrl || upload.url || '');
  const imageBlobUrl = useObjectUrl(imageBlob);
  const username = user?.data.username || 'Korisnik';
  const uploadUser = upload.User || upload.user;
  const userImages = Array.isArray(allImages?.data?.images) ? allImages.data.images : [];
  const galleryProfilePhoto = userImages.find((image: IImage) => image.isProfilePhoto);
  const profilePhoto = galleryProfilePhoto || getProfilePhotoOverride(uploadUser || user?.data);

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#dce4ff] bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        className="relative block w-full overflow-hidden rounded-2xl bg-[#f7f9ff] text-left"
        onClick={() => navigate(`/photo/${upload.id}`)}
      >
        {imageBlobUrl ? (
          <div
            className="aspect-[4/3] w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageBlobUrl})` }}
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
            navigate(
              getUserProfilePath({
                id: upload.userId,
                publicId: upload.userPublicId ?? user?.data?.publicId,
              })
            );
          }}
          userId={upload.userId}
          className="h-11 w-11 rounded-full"
          fgColor="#1f2937"
          profilePhoto={profilePhoto}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">Dodao_la</p>
          <button
            type="button"
            className="block min-w-0 truncate text-left font-bold text-gray-950 hover:text-blue"
            onClick={() =>
              navigate(
                getUserProfilePath({
                  id: upload.userId,
                  publicId: upload.userPublicId ?? user?.data?.publicId,
                })
              )
            }
          >
            {username}
          </button>
        </div>
      </div>
    </article>
  );
};

export default LatestUpload;
