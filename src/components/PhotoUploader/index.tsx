import { useLocalStorage } from '@uidotdev/usehooks';
import { IImage } from '@app/components/Photos';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useUploadPhotos } from './hooks';
import Button from '@app/components/Button';
import Input from '@app/components/Input';
import { BiTrash } from 'react-icons/bi';
import { removeSpacesAndDashes } from '@app/utils/removeSpacesAndDashes';
import Card from '@app/components/Card';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { useDeletePhoto } from '@app/components/Photos/hooks';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { getImageUrl } from '@app/utils/getImageUrl';
import ConfirmModal from '@app/components/ConfirmModal';
import { MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';

export interface ImageDescription {
  description: string;
  imageId: string;
  isProfilePhoto?: boolean;
}

interface IPhotoActionButtonsProps {
  onInputChange: (e: SyntheticEvent) => void;
  onDelete: () => void;
  defaultInputValue: string;
  isChecked?: boolean;
  onCheckboxChange?: (e: SyntheticEvent) => void;
  hasCheckbox?: boolean;
}

const validateFileType = (file: File) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  return allowedTypes.includes(file.type);
};

const DeleteButtonModal = ({
  onDelete,
  isOpen,
  onClose,
}: {
  onClose: () => void;
  onDelete: () => void;
  isOpen: boolean;
}) => {
  return (
    <ConfirmModal isOpen={isOpen} onClose={onClose} onConfirm={onDelete}>
      <div>
        <h2 className="text-xl mb-2">Jesi li siguran_na da želiš obrisati fotografiju?</h2>
      </div>
    </ConfirmModal>
  );
};

const PhotoActionButtons = ({
  onInputChange,
  onDelete,
  defaultInputValue,
  isChecked,
  onCheckboxChange,
  hasCheckbox,
}: IPhotoActionButtonsProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <>
      <DeleteButtonModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={onDelete}
      />
      <Input
        defaultValue={defaultInputValue}
        className="mt-4"
        placeholder="Napiši nešto o fotografiji"
        onChange={onInputChange}
        type="text"
      />
      {hasCheckbox && (
        <div className="flex gap-1 items-center mt-4">
          <input
            type="checkbox"
            onChange={
              onCheckboxChange
                ? onCheckboxChange
                : (e: SyntheticEvent) => {
                    e.preventDefault();
                  }
            }
            checked={isChecked}
          />
          <span>Postavi kao profilnu</span>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button
          type="black"
          className="flex gap-1 items-center"
          onClick={(e: SyntheticEvent | undefined) => {
            e?.preventDefault();
            setIsDeleteModalOpen(true);
          }}
        >
          <span>Obriši</span>
          <BiTrash fontSize={20} />
        </Button>
      </div>
    </>
  );
};

const PhotoUploader = () => {
  const maxNumberOfImages = 5;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userId] = useLocalStorage('userId');
  const { allUserImages } = useGetAllUserImages(userId as string);

  const [updatedImageDescriptions, setUpdatedImageDescriptions] = useState<ImageDescription[]>([]);
  const [newImageDescriptions, setNewImageDescriptions] = useState<ImageDescription[]>([]);
  const { allImages: allExistingImages } = useGetAllImages(userId as string);
  const { deletePhoto } = useDeletePhoto(userId as string);
  const { onUploadPhotos } = useUploadPhotos(userId as string);
  const [newImages, setNewImages] = useState<IImage[]>();
  const [allCheckboxes, setAllCheckboxes] = useState<{ index: number; isProfilePhoto: boolean }[]>(
    []
  );

  useEffect(() => {
    if (allExistingImages && allExistingImages.data.images.length > 0) {
      const checkboxes = allExistingImages.data.images.map((image: IImage, index: number) => {
        return { index, isProfilePhoto: image.isProfilePhoto || false };
      });
      setAllCheckboxes(checkboxes);
    }
  }, [allExistingImages]);

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault();

    if (allUserImages?.data?.length > MAXIMUM_NUMBER_OF_IMAGES) {
      toast.error(`Maksimalan broj svih slika je ${MAXIMUM_NUMBER_OF_IMAGES}`);
      return;
    }

    const files = (e.target as HTMLFormElement)?.avatars?.files;
    const formData = new FormData();
    if (files) {
      formData.append('text', JSON.stringify(newImageDescriptions));
      formData.append('userId', userId as string);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        formData.append('avatars', file);
      }
      onUploadPhotos(formData);
    }

    setNewImages([]);
  };

  const onDescriptionChange = (e: SyntheticEvent, file: IImage) => {
    setNewImageDescriptions((prevState) => {
      const target = e.target as HTMLInputElement;
      const description = target.value;
      const imageId = removeSpacesAndDashes(file.name);
      const image = { description, imageId };
      const newState = prevState.filter(
        (item) => removeSpacesAndDashes(item.imageId) !== removeSpacesAndDashes(imageId)
      );
      newState.push(image);
      return newState;
    });
  };

  const onDeleteFromState = (image: IImage) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setNewImages((prev) =>
      prev?.filter((img) => removeSpacesAndDashes(img.name) !== removeSpacesAndDashes(image.name))
    );
  };

  const onDeleteFromS3 = (image: IImage) => {
    deletePhoto({ url: image.url });
  };

  const onSubmitUpdatePhotos = (e: SyntheticEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', JSON.stringify(updatedImageDescriptions));
    formData.append('userId', userId as string);
    onUploadPhotos(formData);
  };

  const shouldShowEditable = allExistingImages && allExistingImages.data.images.length > 0;

  return (
    <div>
      {shouldShowEditable && (
        <Card className="mb-6">
          <form onSubmit={onSubmitUpdatePhotos}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {allExistingImages.data.images.map((image: IImage, index: number) => {
                return (
                  <div key={`${image.name}-editable`} className="mb-4 max-w-[400px]">
                    <img src={getImageUrl(image)} alt={image.name} />
                    <PhotoActionButtons
                      onInputChange={(e: SyntheticEvent) => {
                        setUpdatedImageDescriptions((prev) => {
                          const target = e.target as HTMLInputElement;
                          const description = target.value;

                          const imageId = removeSpacesAndDashes(image.name);
                          const newImage = { description, imageId };
                          const newState = prev.filter(
                            (item) =>
                              removeSpacesAndDashes(item.imageId) !== removeSpacesAndDashes(imageId)
                          );
                          newState.push(newImage);
                          return newState;
                        });
                      }}
                      onDelete={() => onDeleteFromS3(image)}
                      defaultInputValue={image.description}
                      isChecked={
                        allCheckboxes.find((checkbox) => checkbox.index === index)
                          ?.isProfilePhoto || false
                      }
                      hasCheckbox
                      onCheckboxChange={(e: SyntheticEvent) => {
                        const isChecked = (e.target as HTMLInputElement).checked;
                        setAllCheckboxes((prev) =>
                          prev.map((checkbox) => ({
                            ...checkbox,
                            isProfilePhoto: checkbox.index === index ? isChecked : false,
                          }))
                        );
                        setUpdatedImageDescriptions((prev) => {
                          const imageId = removeSpacesAndDashes(image.name);
                          if (prev.length === 0) {
                            return [
                              {
                                description: image.description,
                                imageId,
                                isProfilePhoto: (e.target as HTMLInputElement).checked,
                              },
                            ];
                          }

                          const newState = prev.map((item) => {
                            if (removeSpacesAndDashes(item.imageId) === imageId) {
                              return { ...item, isProfilePhoto: !item.isProfilePhoto };
                            }
                            return item;
                          });

                          return newState;
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <Button type="primary">
              <span>Spremi</span>
            </Button>
          </form>
        </Card>
      )}
      <Card>
        <form onSubmit={onSubmitHandler}>
          <h2 className="font-bold mt-5 mb-2"> Dodaj nove fotografije </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {newImages &&
              newImages.map((image) => {
                return (
                  <div key={image.name} className="mb-4 max-w-[400px]">
                    <div className="relative w-full aspect-[1/1] overflow-hidden rounded-md">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                    <PhotoActionButtons
                      onInputChange={(e: SyntheticEvent) => onDescriptionChange(e, image)}
                      onDelete={() => onDeleteFromState(image)}
                      defaultInputValue={image.description}
                    />
                  </div>
                );
              })}
          </div>

          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              name="avatars"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  const files = e.target.files;

                  if (
                    files.length +
                      (newImages?.length || 0) +
                      allExistingImages?.data?.images?.length >
                    maxNumberOfImages
                  ) {
                    toast.error(
                      `Maksimalan broj fotografija je ${maxNumberOfImages}!`,
                      toastConfig
                    );
                    return;
                  }

                  const invalidFiles = Array.from(files).filter((file) => !validateFileType(file));
                  if (invalidFiles.length) {
                    toast.error('Dozvoljeni formati su jpeg, jpg i png!', toastConfig);
                    return;
                  }
                  const images = Array.from(files).map((file) => {
                    return {
                      url: URL.createObjectURL(file),
                      name: file.name,
                      fileType: file.type,
                      description: '',
                      userId: userId as string,
                      isProfilePhoto: false,
                    };
                  });

                  setNewImages((prev) => [...(prev || []), ...(images as IImage[])]);
                }
              }}
            />
          </div>
          {newImages && newImages.length > 0 && (
            <Button type="primary">
              <span>Spremi</span>
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
};

export default PhotoUploader;
