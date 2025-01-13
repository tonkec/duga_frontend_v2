import { SetStateAction } from 'react';
import notFound from '../../assets/not_found.svg';
import { ImageDescription } from '../PhotoUploader';
import { useNavigate } from 'react-router';
import { getImageUrl } from '../../utils/getImageUrl';
export interface IImage {
  createdAt: string;
  description: string;
  fileType: string;
  id: number;
  isProfilePhoto: boolean;
  name: string;
  updatedAt: string;
  url: string;
  userId: string;
  isLocal?: boolean;
}

interface IPhotosProps {
  images: IImage[] | undefined;
  notFoundText: string;
  setImageDescriptions?: (e: SetStateAction<ImageDescription[]>) => void;
}

const Photos = ({ images, notFoundText }: IPhotosProps) => {
  const navigate = useNavigate();

  if (!images || !images.length) {
    return (
      <>
        <img src={notFound} className="mx-auto block max-w-[300px]" />
        <h2 className="font-bold mt-5 mb-2 text-center">{notFoundText}</h2>
      </>
    );
  }

  return (
    <>
      <h2 className="font-bold mt-5 mb-2">Fotografije ({images.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {images.map((image: IImage, index: number) => {
          return (
            <div className="max-w-[400px]" key={index}>
              <img
                src={getImageUrl(image)}
                alt="user image"
                onClick={() => {
                  navigate(`/photo/${image.id}`);
                }}
                className="cursor-pointer w-full object-cover rounded-md"
              />
              {image.description && <p className="text-center mt-2">{image.description}</p>}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Photos;
