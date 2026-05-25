import { useNavigate, useParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import { useGetSingleImage } from './hooks';
import Card from '@app/components/Card';
import PhotoComments from '@app/components/PhotoComments';
import PhotoLikes from '@app/components/PhotoLikes';
import Loader from '@app/components/Loader';
import notFound from '@app/assets/not_found.svg';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import Image from '@app/components/Image';
import { useGetUserById } from '@app/hooks/useGetUserById';
import UserAvatar from '@app/components/UserAvatar';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

const PhotoPage = () => {
  const navigate = useNavigate();
  const { photoId } = useParams();
  const { singleImage, singleImageLoading } = useGetSingleImage(photoId as string);
  const { data: imageBlob } = useGetImageBlob(
    singleImage?.data?.securePhotoUrl || singleImage?.data?.url || ''
  );

  const { user: userData } = useGetUserById(singleImage?.data?.userId || '');
  const { user: currentUser } = useGetCurrentUser();

  if (singleImageLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (!singleImage) {
    return (
      <AppLayout>
        <Card>
          <div className="flex flex-col justify-center items-center max-w-lg mx-auto">
            <Image src={notFound} alt="Nije pronađena" />
            <p className="text-center">Slika nije pronađena ili je obrisana.</p>
          </div>
        </Card>
      </AppLayout>
    );
  }

  const showAvatar = () => {
    const userId = userData?.data?.id;
    const username = userData?.data?.username;
    if (!userId || !username) {
      return null;
    }

    if (currentUser?.data?.id === userId) {
      return (
        <div className="flex items-center gap-2">
          <UserAvatar
            className="w-8 h-8 rounded-full"
            color="#F037A5"
            avatarFallbackName={`${username}`}
            userId={String(userId)}
          />
          <span>{username}</span>
        </div>
      );
    }

    return (
      <button
        onClick={() => navigate(`/user/${userId}`)}
        className="flex items-center gap-2 hover:underline"
      >
        <UserAvatar
          className="w-8 h-8 rounded-full"
          color="#F037A5"
          avatarFallbackName={`${username}`}
          userId={String(userId)}
        />
        <span>{username}</span>
      </button>
    );
  };

  return (
    <AppLayout>
      <div className="grid gap-6">
        <Card className="rounded-2xl p-4 md:p-5">
          <div>
            {imageBlob ? (
              <>
                <div className="overflow-hidden rounded-2xl bg-black">
                  <Image
                    src={URL.createObjectURL(imageBlob)}
                    alt="Korisnikova slika"
                    className="mx-auto max-h-[75vh] w-full object-contain"
                  />
                </div>

                <div className="mt-4 rounded-2xl bg-[#f7f9ff] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {showAvatar()}
                    {singleImage?.data?.description && (
                      <p className="text-gray-700 sm:text-right">{singleImage?.data.description}</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <PhotoLikes photoId={photoId} />
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-[#f7f9ff] p-8 text-center text-gray-600">
                Fotografija se nije mogla učitati.
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl p-4 md:p-5">
          <PhotoComments />
        </Card>
      </div>
    </AppLayout>
  );
};

export default PhotoPage;
