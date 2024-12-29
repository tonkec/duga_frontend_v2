import { SetStateAction, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import Modal from 'react-modal';
import Button from '../../components/Button';
import { BiArrowBack } from 'react-icons/bi';
import notFound from '../../assets/not_found.svg';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { REACT_APP_S3_BUCKET_URL } from '../../utils/getProfilePhoto';
import { ImageDescription } from '../PhotoUploader';
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

Modal.setAppElement('#root');
const customStyles = {
  content: {
    width: '600px',
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '750px',
  },
};

const getImageUrl = (image: IImage) => {
  if (image.isLocal) {
    return image.url;
  }
  return `${REACT_APP_S3_BUCKET_URL}/${image.url}`;
};

const Photos = ({ images, notFoundText, isEditable }: IPhotosProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
      {!isEditable && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
          style={customStyles}
        >
          <div>
            <Button type="icon" onClick={closeModal}>
              <BiArrowBack fontSize={20} />
            </Button>
            <Carousel selectedItem={imageIndex}>
              {images.map((image: IImage, index: number) => {
                return (
                  <div className="relative" key={index}>
                    <img src={`${REACT_APP_S3_BUCKET_URL}/${image.url}`} alt="user image" />
                    <p className="absolute top-0 px-4 py-2 w-full bg-black text-white">
                      {image.description}
                    </p>
                  </div>
                );
              })}
            </Carousel>
          </div>
        </Modal>
      )}
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
                  if (!isEditable) {
                    setImageIndex(index);
                    setIsModalOpen(true);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Photos;
