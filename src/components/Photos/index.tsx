import { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import Modal from 'react-modal';
import Button from '../../components/Button';
import { BiArrowBack } from 'react-icons/bi';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

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
}

interface IPhotosProps {
  images: IImage[];
}

export const REACT_APP_S3_BUCKET_URL = 'https://duga-user-photo.s3.eu-north-1.amazonaws.com';
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

const Photos = ({ images }: IPhotosProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!images) {
    return 'Ovaj korisnik nema nijednu fotku';
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
            {images.map((image: IImage) => {
              return (
                <div className="relative">
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
      <h2 className="font-bold mt-5 mb-2">Fotografije</h2>
      <div className="flex gap-5">
        {images.map((image: IImage, index: number) => {
          return (
            <div className="max-w-[400px]">
              <img
                className="cursor-pointer"
                src={`${REACT_APP_S3_BUCKET_URL}/${image.url}`}
                alt="user image"
                onClick={() => {
                  setIsModalOpen(!isModalOpen);
                  setImageIndex(index);
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
