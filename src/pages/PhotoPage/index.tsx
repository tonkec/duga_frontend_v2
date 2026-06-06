import { useNavigate, useParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import { useGetSingleImage, useSetProfilePhoto } from './hooks';
import Card from '@app/components/Card';
import PhotoComments from '@app/components/PhotoComments';
import PhotoLikes from '@app/components/PhotoLikes';
import Loader from '@app/components/Loader';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import Image from '@app/components/Image';
import { useGetUserById } from '@app/hooks/useGetUserById';
import UserAvatar from '@app/components/UserAvatar';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import Button from '@app/components/Button';
import ContentFormatter from '@app/components/ContentFormatter';
import { getUserProfilePath } from '@app/utils/userProfilePath';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import { BiImageAlt } from 'react-icons/bi';

const PhotoPage = () => {
  const navigate = useNavigate();
  const { photoId } = useParams();
  const { singleImage, singleImageLoading } = useGetSingleImage(photoId as string);
  const imageSources = [
    singleImage?.data?.securePhotoUrl,
    singleImage?.data?.url,
    singleImage?.data?.imageUrl,
    singleImage?.data?.messagePhotoUrl,
  ].filter((source): source is string => Boolean(source));
  const firstImageQuery = useGetImageBlob(imageSources[0] || '');
  const secondImageQuery = useGetImageBlob(imageSources[1] || '');
  const thirdImageQuery = useGetImageBlob(imageSources[2] || '');
  const fourthImageQuery = useGetImageBlob(imageSources[3] || '');
  const imageBlob = [firstImageQuery, secondImageQuery, thirdImageQuery, fourthImageQuery].find(
    (query) => query.data
  )?.data;
  const imageBlobUrl = useObjectUrl(imageBlob);

  const { user: userData } = useGetUserById(singleImage?.data?.userId || '');
  const { user: currentUser } = useGetCurrentUser();
  const { setProfilePhoto, isSettingProfilePhoto } = useSetProfilePhoto();

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
        <Card data-testid="photo-not-found-state">
          <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-blue/10 text-blue">
              <BiImageAlt size={34} />
            </div>
            <p>Slika nije pronađena ili je obrisana.</p>
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
        <div className="inline-flex items-center gap-3 rounded-full border border-[#dce4ff] bg-white px-3 py-2 shadow-sm">
          <UserAvatar
            className="h-10 w-10 rounded-full"
            color="#2D46B9"
            avatarFallbackName={`${username}`}
            userId={String(userId)}
          />
          <span className="text-sm font-bold text-gray-950">{username}</span>
        </div>
      );
    }

    return (
      <button
        onClick={() =>
          navigate(getUserProfilePath({ id: userId, publicId: userData?.data?.publicId }))
        }
        className="inline-flex items-center gap-3 rounded-full border border-[#dce4ff] bg-white px-3 py-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-md hover:shadow-blue/10"
      >
        <UserAvatar
          className="h-10 w-10 rounded-full"
          color="#2D46B9"
          avatarFallbackName={`${username}`}
          userId={String(userId)}
        />
        <span className="text-sm font-bold text-gray-950">{username}</span>
      </button>
    );
  };

  const isOwnPhoto = Number(currentUser?.data?.id) === Number(singleImage.data.userId);
  const canSetProfilePhoto = isOwnPhoto && singleImage.data.name;

  return (
    <AppLayout>
      <div className="grid gap-6" data-testid="photo-page">
        <Card className="rounded-2xl p-4 md:p-5">
          <div>
            {imageBlobUrl ? (
              <>
                <div className="overflow-hidden rounded-2xl bg-black">
                  <Image
                    src={imageBlobUrl}
                    alt="Korisnikova slika"
                    className="mx-auto max-h-[75vh] w-full object-contain"
                  />
                </div>

                <div className="mt-4 rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    {showAvatar()}
                    <PhotoLikes photoId={photoId} />
                    {canSetProfilePhoto &&
                      (singleImage.data.isProfilePhoto ? (
                        <span className="rounded-full border border-blue/20 bg-blue/10 px-4 py-2 text-sm font-bold text-blue">
                          Trenutna profilna
                        </span>
                      ) : (
                        <Button
                          type="blue"
                          className="rounded-full px-4 py-2 text-sm font-bold"
                          disabled={isSettingProfilePhoto}
                          onClick={() =>
                            setProfilePhoto({
                              imageName: singleImage.data.name,
                              description: singleImage.data.description,
                              taggedUserIds: singleImage.data.taggedUsers?.map(
                                (user: { id: number }) => Number(user.id)
                              ),
                              photoId: photoId as string,
                              userId: String(currentUser?.data?.id),
                            })
                          }
                        >
                          {isSettingProfilePhoto ? 'Spremam...' : 'Postavi kao profilnu'}
                        </Button>
                      ))}
                  </div>
                  {singleImage?.data?.description && (
                    <p className="mt-3 text-gray-700">
                      <ContentFormatter
                        text={singleImage.data.description}
                        taggedUsers={singleImage.data.taggedUsers}
                      />
                    </p>
                  )}
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
