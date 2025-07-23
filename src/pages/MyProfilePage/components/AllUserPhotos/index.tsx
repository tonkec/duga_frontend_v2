import Button from '@app/components/Button';
import { IImage } from '@app/components/Photos';
import Photo from '@app/components/Photos/components/Photo';
import { useDeletePhoto } from '@app/components/Photos/hooks';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import notFound from '@app/assets/not_found.svg';

const AllUserPhotos = () => {
  const { allUserImages } = useGetAllUserImages();
  const { deletePhoto, isDeleting } = useDeletePhoto();

  const handleDelete = (url: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      deletePhoto({ url });
    }
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
    <div className="grid grid-cols-2 gap-4">
      {allUserImages?.data.map((image: IImage, index: number) => (
        <div key={index} className="relative max-w-[400px]">
          <Photo image={image} />
          <Button onClick={() => handleDelete(image.url)} disabled={isDeleting} type="danger">
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AllUserPhotos;
