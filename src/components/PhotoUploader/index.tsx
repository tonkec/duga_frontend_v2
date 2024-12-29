import { useLocalStorage } from '@uidotdev/usehooks';
import { IImage } from '../Photos';
import { SyntheticEvent, useState } from 'react';
import { useUploadPhotos } from './hooks';
import Button from '../Button';
import Input from '../Input';
import { BiTrash } from 'react-icons/bi';
import { removeSpacesAndDashes } from '../../utils/removeSpacesAndDashes';
export interface ImageDescription {
  description: string;
  imageId: string;
}
const PhotoUploader = () => {
  const [imageDescriptions, setImageDescriptions] = useState<ImageDescription[]>([]);
  const [userId] = useLocalStorage('userId');
  const { onUploadPhotos } = useUploadPhotos(userId as string);

  const [allUserImages, setAllUserImages] = useState<IImage[]>();

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    const files = (e.target as HTMLFormElement).avatars.files;
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
      const newState = prevState.filter((item) => item.imageId !== imageId);
      newState.push(image);
      return newState;
    });
  };

  return (
    <div>
      <form onSubmit={onSubmitHandler}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {allUserImages &&
            allUserImages.map((image) => {
              return (
                <div key={image.name} className="mb-4 max-w-[400px]">
                  <img src={image.url} alt={image.name} />

                  <>
                    <Input
                      className="mt-4"
                      placeholder="Napiši nešto o fotografiji"
                      onChange={(e) => {
                        onDescriptionChange(e, image);
                      }}
                    />

                    <div className="mt-4 flex gap-2">
                      <Button
                        type="black"
                        className="flex gap-1 items-center"
                        onClick={() => {
                          setAllUserImages((prev) =>
                            prev?.filter((img) => img.name !== image.name)
                          );
                        }}
                      >
                        <span>Obriši</span>
                        <BiTrash fontSize={20} />
                      </Button>
                    </div>
                    <div className="flex gap-1 items-center mt-4">
                      <input type="checkbox" /> <span>Postavi kao profilnu</span>
                    </div>
                  </>
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
    </div>
  );
};

export default PhotoUploader;
