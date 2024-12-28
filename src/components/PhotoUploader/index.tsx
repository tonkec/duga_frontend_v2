import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Photos, { IImage } from '../Photos';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useUploadPhotos } from './hooks';
import Button from '../Button';

const PhotoUploader = () => {
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
    const files = (e.target as HTMLFormElement).avatars.files; // Use `avatars` as the name
    const formData = new FormData();

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('avatars', files[i]);
      }
    }

    formData.append('userId', userId as string);
    formData.append('text', 'some text');

    onUploadPhotos(formData);
  };

  return (
    <div>
      <div className="mb-12">
        {allUserImages && (
          <Photos images={allUserImages} notFoundText="Nema fotografija" isEditable />
        )}
      </div>
      <form onSubmit={onSubmitHandler}>
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
