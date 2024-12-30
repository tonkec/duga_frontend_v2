import { useLocalStorage } from '@uidotdev/usehooks';
import { getImageUrl, IImage } from '../Photos';
import { SyntheticEvent, useRef, useState } from 'react';
import { useUploadPhotos } from './hooks';
import Button from '../Button';
import Input from '../Input';
import { BiTrash } from 'react-icons/bi';
import { removeSpacesAndDashes } from '../../utils/removeSpacesAndDashes';
import Card from '../Card';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { useDeletePhoto } from '../Photos/hooks';
import { toast } from 'react-toastify';
import { toastConfig } from '../../configs/toast.config';
export interface ImageDescription {
  description: string;
  imageId: string;
  isProfilePhoto?: boolean;
}

interface IPhotoActionButtonsProps {
  onInputChange: (e: SyntheticEvent) => void;
  onDelete: () => void;
  defaultInputValue: string;
  defaultCheckboxValue?: boolean;
  onCheckboxChange: (e: SyntheticEvent) => void;
}

const validateFileType = (file: File) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  return allowedTypes.includes(file.type);
};

const PhotoActionButtons = ({
  onInputChange,
  onDelete,
  defaultInputValue,
  defaultCheckboxValue,
  onCheckboxChange,
}: IPhotoActionButtonsProps) => {
  return (
    <>
      <Input
        defaultValue={defaultInputValue}
        className="mt-4"
        placeholder="Napiši nešto o fotografiji"
        onChange={onInputChange}
      />
      <div className="flex gap-1 items-center mt-4">
        <input
          type="checkbox"
          onChange={(e) => onCheckboxChange(e)}
          defaultChecked={defaultCheckboxValue}
        />
        <span>Postavi kao profilnu</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="black" className="flex gap-1 items-center" onClick={onDelete}>
          <span>Obriši</span>
          <BiTrash fontSize={20} />
        </Button>
      </div>
    </>
  );
};

const PhotoUploader = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userId] = useLocalStorage('userId');
  const [updatedImageDescriptions, setUpdatedImageDescriptions] = useState<ImageDescription[]>([]);
  const [newImageDescriptions, setNewImageDescriptions] = useState<ImageDescription[]>([]);
  const { allImages: allExistingImages } = useGetAllImages(userId as string);
  const { deletePhoto } = useDeletePhoto(userId as string);
  const { onUploadPhotos } = useUploadPhotos(userId as string);
  const [newImages, setNewImages] = useState<IImage[]>();

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    const files = (e.target as HTMLFormElement)?.avatars?.files;
    const formData = new FormData();
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        formData.append('avatars', file);
      }
    }
    formData.append('text', JSON.stringify(newImageDescriptions));
    formData.append('userId', userId as string);

    onUploadPhotos(formData);
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
          <form
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4"
            onSubmit={onSubmitUpdatePhotos}
          >
            {allExistingImages.data.images.map((image: IImage) => {
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
                    defaultCheckboxValue={image.isProfilePhoto}
                    onCheckboxChange={(e: SyntheticEvent) => {
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
            <div className="col-span-3">
              <Button type="primary">
                <span>Spremi</span>
              </Button>
            </div>
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
                    <img src={image.url} alt={image.name} />
                    <PhotoActionButtons
                      onInputChange={(e: SyntheticEvent) => onDescriptionChange(e, image)}
                      onDelete={() => onDeleteFromState(image)}
                      defaultInputValue={image.description}
                      onCheckboxChange={(e: SyntheticEvent) => {
                        setNewImageDescriptions((prev) => {
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
                            if (
                              removeSpacesAndDashes(item.imageId) === removeSpacesAndDashes(imageId)
                            ) {
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

          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              name="avatars"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  const files = e.target.files;
                  const invalidFiles = Array.from(files).filter((file) => !validateFileType(file));
                  if (invalidFiles.length) {
                    toast.error('Dozvoljeni formati su jpeg, jpg i png', toastConfig);
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
                      isLocal: true,
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
