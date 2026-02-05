import { useParams } from 'react-router';
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

const PhotoPage = () => {
  const { photoId } = useParams();
  const { singleImage, singleImageLoading } = useGetSingleImage(photoId as string);
  const { data: imageBlob } = useGetImageBlob(
    singleImage?.data?.securePhotoUrl || singleImage?.data?.url || ''
  );

  const { user: userData } = useGetUserById(singleImage?.data?.userId || '');

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
            <Image src={notFound} alt="Not found" />
            <p className="text-center">Slika nije pronađena ili je obrisana.</p>
          </div>
        </Card>
      </AppLayout>
    );
  }

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
                    <UserAvatar
                      className="w-10 h-10 rounded-full"
                      color="#F037A5"
                      avatarFallbackName={`${userData?.data?.username}`}
                      userId={userData?.data?.id}
                    />
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
