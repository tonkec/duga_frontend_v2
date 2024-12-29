import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Photos from '../Photos';

const EditablePhotos = () => {
  const [userId] = useLocalStorage('userId');
  const { allImages: allExistingImages } = useGetAllImages(userId as string);
  return (
    <div>
      <Photos
        isEditable
        notFoundText="Još nemaš ni jednu fotografiju."
        images={allExistingImages?.data.images}
      />
    </div>
  );
};

export default EditablePhotos;
