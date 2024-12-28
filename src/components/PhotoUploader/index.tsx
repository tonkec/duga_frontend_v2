import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Photos from '../Photos';
import { SyntheticEvent } from 'react';
import { useUploadPhotos } from './hooks';

const PhotoUploader = () => {
  const [userId] = useLocalStorage('userId');
  const { onUploadPhotos } = useUploadPhotos(userId as string);

  const { allImages: allUserImages } = useGetAllImages(userId as string);

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
        <Photos
          isEditable={true}
          notFoundText="Nema postojećih fotografija."
          images={allUserImages?.data.images}
        />
      </div>
      <form onSubmit={onSubmitHandler}>
        <input type="file" name="avatars" multiple />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default PhotoUploader;
