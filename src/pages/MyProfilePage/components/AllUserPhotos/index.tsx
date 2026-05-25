import Button from '@app/components/Button';
import { IImage } from '@app/components/Photos';
import Photo from '@app/components/Photos/components/Photo';
import { useDeletePhoto } from '@app/components/Photos/hooks';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import notFound from '@app/assets/not_found.svg';
import ConfirmModal from '@app/components/ConfirmModal';
import { useState } from 'react';
import { MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';
import Image from '@app/components/Image';
import Loader from '@app/components/Loader';

const photoTypeLabels = {
  chat: 'Chat fotografija',
  comment: 'Fotografija iz komentara',
  profile: 'Profilna fotografija',
};

interface IDeletePhotoModalProps {
  setIsDeleteModalVisible: (visible: boolean) => void;
  onDeletePhoto: () => void;
  isDeleteModalVisible: boolean;
}

const DeletePhotoModal = ({
  isDeleteModalVisible,
  onDeletePhoto,
  setIsDeleteModalVisible,
}: IDeletePhotoModalProps) => {
  return (
    <ConfirmModal
      isOpen={isDeleteModalVisible}
      onConfirm={onDeletePhoto}
      onClose={() => setIsDeleteModalVisible(false)}
    >
      <h2 className="text-xl text-center"> Jesi li siguran_na da želiš obrisati fotografiju?</h2>
      <p className="text-center">
        Brisanjem fotografije uklanja se i sve što je s njom povezano (npr. komentar ili poruka).
      </p>
    </ConfirmModal>
  );
};

const getPhotoTypeLabel = (image: IImage) => {
  const explicitType = [image.photoType, image.source, image.type, image.origin]
    .find(Boolean)
    ?.toLowerCase();
  const imagePath = [
    image.url,
    image.securePhotoUrl,
    image.messagePhotoUrl,
    image.imageUrl,
    image.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    explicitType?.includes('chat') ||
    image.chatId ||
    image.messageId ||
    imagePath.includes('/chat/') ||
    imagePath.includes('chat/')
  ) {
    return photoTypeLabels.chat;
  }

  if (
    explicitType?.includes('comment') ||
    image.commentId ||
    image.uploadCommentId ||
    imagePath.includes('/comment') ||
    imagePath.includes('comment/')
  ) {
    return photoTypeLabels.comment;
  }

  return photoTypeLabels.profile;
};

const AllUserPhotos = () => {
  const { allUserImages, allUserImagesError, allUserImagesLoading } = useGetAllUserImages();
  const { deletePhoto, isDeleting } = useDeletePhoto(['uploads', 'user-photos']);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const photos: IImage[] = Array.isArray(allUserImages?.data)
    ? allUserImages.data
    : allUserImages?.data?.images || [];

  const handleDelete = () => {
    deletePhoto({ url: photoUrl });
    setIsDeleteModalVisible(false);
  };

  if (allUserImagesLoading) {
    return <Loader />;
  }

  if (allUserImagesError) {
    return <h2 className="font-bold mt-5 mb-2 text-center">Fotografije se nisu učitale.</h2>;
  }

  if (!photos.length) {
    return (
      <>
        <Image src={notFound} alt="Nema fotografija" className="mx-auto block max-w-[300px]" />
        <h2 className="font-bold mt-5 mb-2 text-center">Nema fotografija</h2>
      </>
    );
  }

  return (
    <>
      <DeletePhotoModal
        isDeleteModalVisible={isDeleteModalVisible}
        onDeletePhoto={handleDelete}
        setIsDeleteModalVisible={setIsDeleteModalVisible}
      />
      <p className="mb-4">
        Trenutno imaš {photos.length} od maksimalno {MAXIMUM_NUMBER_OF_IMAGES} fotografija.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((image: IImage) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] p-3 shadow-sm"
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-white">
              <Photo image={image} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#dce4ff] px-3 py-1 text-sm font-semibold text-blue">
                {getPhotoTypeLabel(image)}
              </span>
              {image.isProfilePhoto && (
                <span className="inline-flex rounded-full bg-blue px-3 py-1 text-sm font-semibold text-white">
                  Trenutna profilna
                </span>
              )}
            </div>
            <Button
              onClick={() => {
                setIsDeleteModalVisible(true);
                setPhotoUrl(image.url);
              }}
              disabled={isDeleting}
              type="danger"
              className="mt-4"
            >
              Obriši
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default AllUserPhotos;
