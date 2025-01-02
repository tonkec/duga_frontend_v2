import { SetStateAction, useState } from 'react';
import notFound from '../../assets/not_found.svg';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { REACT_APP_S3_BUCKET_URL } from '../../utils/getProfilePhoto';
import { ImageDescription } from '../PhotoUploader';
import TextArea from '../Textarea';
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
  isEditable?: boolean;
  setImageDescriptions?: (e: SetStateAction<ImageDescription[]>) => void;
}

export const getImageUrl = (image: IImage) => {
  if (image.isLocal) {
    return image.url;
  }
  return `${REACT_APP_S3_BUCKET_URL}/${image.url}`;
};

const PhotoPreviewer = ({
  currentImageURL,
  setCurrentImageURL,
  currentImageDescription,
}: {
  currentImageDescription: string | null;
  currentImageURL: string | null;
  setCurrentImageURL: (e: string | null) => void;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex p-4">
      <button
        className="absolute top-0 right-0 p-2 bg-white rounded-full"
        onClick={() => setCurrentImageURL(null)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="relative">
        <img src={currentImageURL ? currentImageURL : ''} alt="current image" />
      </div>
      <div className="flex-1">
        {currentImageDescription && (
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Opis</h2>
            <p>{currentImageDescription}</p>
          </div>
        )}
        <form className="">
          <TextArea placeholder="Napiši komentar" />
        </form>
      </div>
    </div>
  );
};

const Photos = ({ images, notFoundText, isEditable }: IPhotosProps) => {
  const [currentImageURL, setCurrentImageURL] = useState<string | null>(null);
  const [currentImageDescription, setCurrentImageDescription] = useState<string | null>(null);

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
                className={!isEditable ? 'cursor-pointer' : ''}
                src={getImageUrl(image)}
                alt="user image"
                onClick={() => {
                  setCurrentImageURL(getImageUrl(image));
                  setCurrentImageDescription(image.description);
                }}
              />
            </div>
          );
        })}
      </div>

      {currentImageURL && (
        <PhotoPreviewer
          currentImageURL={currentImageURL}
          setCurrentImageURL={setCurrentImageURL}
          currentImageDescription={currentImageDescription}
        />
      )}
    </>
  );
};

export default Photos;
