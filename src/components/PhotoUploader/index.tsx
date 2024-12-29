import { useLocalStorage } from '@uidotdev/usehooks';
import { getImageUrl, IImage } from '../Photos';
import { SyntheticEvent, useState } from 'react';
import { useUploadPhotos } from './hooks';
import Button from '../Button';
import Input from '../Input';
import { BiTrash } from 'react-icons/bi';
import { removeSpacesAndDashes } from '../../utils/removeSpacesAndDashes';
import Card from '../Card';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { useDeletePhoto } from '../Photos/hooks';
export interface ImageDescription {
  description: string;
  imageId: string;
}

interface IPhotoActionButtonsProps {
  onInputChange: (e: SyntheticEvent) => void;
  onDelete: () => void;
  defaultInputValue: string;
}

const PhotoActionButtons = ({
  onInputChange,
  onDelete,
  defaultInputValue,
}: IPhotoActionButtonsProps) => {
  return (
    <>
      <Input
        defaultValue={defaultInputValue}
        className="mt-4"
        placeholder="Napiši nešto o fotografiji"
        onChange={onInputChange}
      />
      <div className="mt-4 flex gap-2">
        <Button type="black" className="flex gap-1 items-center" onClick={onDelete}>
          <span>Obriši</span>
          <BiTrash fontSize={20} />
        </Button>
      </div>
      <div className="flex gap-1 items-center mt-4">
        <input type="checkbox" /> <span>Postavi kao profilnu</span>
      </div>
    </>
  );
};

const PhotoUploader = () => {
  const [updatedImageDescriptions, setUpdatedImageDescriptions] = useState<ImageDescription[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<ImageDescription[]>([]);
  const [userId] = useLocalStorage('userId');
  const { allImages: allExistingImages } = useGetAllImages(userId as string);
  const { deletePhoto } = useDeletePhoto(userId as string);

  const { onUploadPhotos } = useUploadPhotos(userId as string);

  const [allUserImages, setAllUserImages] = useState<IImage[]>();

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
    formData.append('text', JSON.stringify(imageDescriptions));
    formData.append('userId', userId as string);

    onUploadPhotos(formData);
  };

  const onDescriptionChange = (e: SyntheticEvent, file: IImage) => {
    setImageDescriptions((prevState) => {
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
    setAllUserImages((prev) =>
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

  return (
    <div>
      <Card className="mb-6">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4"
          onSubmit={onSubmitUpdatePhotos}
        >
          {allExistingImages &&
            allExistingImages.data.images.map((image: IImage) => {
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
                  />
                </div>
              );
            })}
          <Button type="primary">
            <span>Spremi</span>
          </Button>
        </form>
      </Card>
      <Card>
        <form onSubmit={onSubmitHandler}>
          <h2 className="font-bold mt-5 mb-2"> Dodaj nove fotografije </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {allUserImages &&
              allUserImages.map((image) => {
                return (
                  <div key={image.name} className="mb-4 max-w-[400px]">
                    <img src={image.url} alt={image.name} />
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
              type="file"
              name="avatars"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  const files = e.target.files;
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

                  setAllUserImages((prev) => [...(prev || []), ...(images as IImage[])]);
                }
              }}
            />
          </div>
          <Button type="primary">
            <span>Spremi</span>
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PhotoUploader;
