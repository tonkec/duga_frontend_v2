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
import Divider from '@app/components/Divider';
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
      <Card>
        <div className="lg:flex gap-4 items-start">
          <div className="flex-1">
            {imageBlob ? (
              <>
                <div>
                  <Image src={URL.createObjectURL(imageBlob)} alt="Korisnikova slika" />
                  <div className="flex justify-between mt-4">
                    {showAvatar()}
                    {singleImage?.data?.description && (
                      <p className="py-2">{singleImage?.data.description}</p>
                    )}
                  </div>
                </div>
                <Divider className="my-4" height={1} />
                <div className="flex justify-between items-center">
                  <PhotoLikes photoId={photoId} />
                </div>
              </>
            ) : (
              <p> Greška </p>
            )}
          </div>

          <div className="flex-1">
            <PhotoComments />
          </div>
        </div>
      </Card>
    </AppLayout>
  );
};

export default PhotoPage;
