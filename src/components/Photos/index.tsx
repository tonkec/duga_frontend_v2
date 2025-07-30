import { SetStateAction } from 'react';
import notFound from '@app/assets/not_found.svg';
import { ImageDescription } from '@app/components/PhotoUploader';
import PhotoLikes from '@app/components/PhotoLikes';

import Photo from './components/Photo';
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
  securePhotoUrl: string;
}

interface IPhotosProps {
  images: IImage[] | undefined;
  notFoundText: string;
  setImageDescriptions?: (e: SetStateAction<ImageDescription[]>) => void;
}

const Photos = ({ images, notFoundText }: IPhotosProps) => {
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
              <Photo image={image} />
              {image.description && <p className="mt-2">{image.description}</p>}
              <PhotoLikes photoId={String(image.id)} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Photos;
