import { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import Modal from 'react-modal';
import Button from '../../components/Button';
import { BiArrowBack, BiTrash } from 'react-icons/bi';
import notFound from '../../assets/not_found.svg';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { REACT_APP_S3_BUCKET_URL } from '../../utils/getProfilePhoto';
import Input from '../Input';
import { useDeletePhoto } from './hooks';
import { useLocalStorage } from '@uidotdev/usehooks';

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
  images: IImage[];
  notFoundText: string;
  isEditable?: boolean;
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

const PhotoActionButtons = ({ onRemove }: { onRemove: () => void }) => {
  return (
    <>
      <Input className="mt-4 mb-4" placeholder="Napiši nešto o fotografiji" />
      <div className="mt-4 flex gap-2">
        <Button type="black" className="flex gap-1 items-center" onClick={onRemove}>
          <span>Obriši</span>
          <BiTrash fontSize={20} />
        </Button>
      </div>
      <div className="flex gap-1 items-center mt-4">
        <input type="checkbox" /> <span>Postavi kao profilnu</span>
      </div>
    </>
  );
};

const getImageUrl = (image: IImage) => {
  if (image.isLocal) {
    return image.url;
  }
  return `${REACT_APP_S3_BUCKET_URL}/${image.url}`;
};

const Photos = ({ images, notFoundText, isEditable }: IPhotosProps) => {
  const [userId] = useLocalStorage('userId');
  const { deletePhoto } = useDeletePhoto(userId as string);
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
                  <img
                    className="cursor-pointer"
                    src={`${REACT_APP_S3_BUCKET_URL}/${image.url}`}
                    alt="user image"
                  />
                  <p className="absolute top-0 px-4 py-2 w-full bg-black text-white">
                    {image.description}
                  </p>
                </div>
              );
            })}
          </Carousel>
        </div>
      </Modal>
      <h2 className="font-bold mt-5 mb-2">Fotografije ({images.length})</h2>
      <div className="flex gap-5">
        {images.map((image: IImage, index: number) => {
          return (
            <div className="max-w-[400px]" key={index}>
              <img
                className="cursor-pointer"
                src={getImageUrl(image)}
                alt="user image"
                onClick={() => {
                  setIsModalOpen(!isModalOpen);
                  setImageIndex(index);
                }}
              />

              {isEditable && (
                <PhotoActionButtons
                  onRemove={() => {
                    deletePhoto({ url: image.url });
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Photos;
