import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Photos from '../Photos';
import { apiClient } from '../../api';
import { SyntheticEvent } from 'react';

const PhotoUploader = () => {
  const [userId] = useLocalStorage('userId');
  const { allImages: allUserImages } = useGetAllImages(userId as string);
  const client = apiClient({ isAuth: false });

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = (e.target as HTMLFormElement).avatar;
    const file = fileInput.files[0];

    if (file) {
      formData.append('avatar', file);
    } else {
      console.error('No file selected.');
      return;
    }

    client.post(`/uploads/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
        <input type="file" name="avatar" multiple />

        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default PhotoUploader;
