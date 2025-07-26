import Button from '@app/components/Button';
import { IImage } from '@app/components/Photos';
import Photo from '@app/components/Photos/components/Photo';
import { useDeletePhoto } from '@app/components/Photos/hooks';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import notFound from '@app/assets/not_found.svg';
import ConfirmModal from '@app/components/ConfirmModal';
import { useState } from 'react';
import { MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';

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

const AllUserPhotos = () => {
  const { allUserImages } = useGetAllUserImages();
  const { deletePhoto, isDeleting } = useDeletePhoto();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const handleDelete = () => {
    deletePhoto({ url: photoUrl });
    setIsDeleteModalVisible(false);
  };

  if (!allUserImages?.data.length) {
    return (
      <>
        <img src={notFound} className="mx-auto block max-w-[300px]" />
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
        Trenutno imaš {allUserImages.data.length} od maximalno {MAXIMUM_NUMBER_OF_IMAGES}{' '}
        fotografija.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {allUserImages?.data.map((image: IImage, index: number) => (
          <div key={index} className="relative max-w-[400px]">
            <Photo image={image} />
            <Button
              onClick={() => {
                setIsDeleteModalVisible(true);
                setPhotoUrl(image.url);
              }}
              disabled={isDeleting}
              type="danger"
              className="mt-4"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default AllUserPhotos;
