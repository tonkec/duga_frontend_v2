import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Photos, { IImage } from '../Photos';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useUploadPhotos } from './hooks';
import Button from '../Button';
export interface ImageDescription {
  description: string;
  imageId: string;
}
const PhotoUploader = () => {
  const [imageDescriptions, setImageDescriptions] = useState<ImageDescription[]>([]);
  const [userId] = useLocalStorage('userId');
  const { onUploadPhotos } = useUploadPhotos(userId as string);

  const { allImages: existingImages } = useGetAllImages(userId as string);
  const [allUserImages, setAllUserImages] = useState<IImage[]>();

  useEffect(() => {
    if (existingImages) {
      setAllUserImages(existingImages.data.images);
    }
  }, [existingImages]);

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

  return (
    <div>
      <form onSubmit={onSubmitHandler}>
        <div className="mb-12">
          <Photos
            setImageDescriptions={setImageDescriptions}
            images={allUserImages}
            notFoundText="Još nemaš nijednu fotografiju"
            isEditable
          />
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
