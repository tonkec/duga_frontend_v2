import { useState } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { BiCloudUpload } from 'react-icons/bi';
import Button from '../Button';
import FieldError from '../FieldError';
import { BiX } from 'react-icons/bi';
import { BiCheck } from 'react-icons/bi';

const photoLimit = 5;

const PhotoUploader = () => {
  const [images, setImages] = useState([]);
  const maxNumber = photoLimit;

  const onChange = (imageList: ImageListType) => {
    if (imageList.length > maxNumber) {
      console.log('b');
    }
    console.log(imageList);
    setImages(imageList as never[]);
  };

  return (
    <div>
      <ImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber}>
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
          errors,
        }) => (
          <>
            <div className="w-full text-left">
              <button
                style={isDragging ? { color: 'red' } : undefined}
                onClick={onImageUpload}
                {...dragProps}
                className="flex w-full flex-col inline-block border-2 mb-6 border-black px-4 justfiy-center items-center rounded py-12"
              >
                <BiCloudUpload fontSize={80} />
                <h2>Dovuci ili klikni</h2>
              </button>
            </div>
            {errors?.maxNumber && (
              <FieldError
                isSelfRemoving
                className="text-center max-w-[160px]"
                message="Previše slika!"
              />
            )}

            <div>
              <div className="flex gap-4 mt-2">
                {imageList.map((image, index) => (
                  <div key={index}>
                    <img src={image.dataURL} alt="tvoja slika" width="200" />
                    <div className="flex gap-1 justify-between mt-4">
                      <Button className="flex-1" type="black" onClick={() => onImageRemove(index)}>
                        Obriši
                      </Button>
                      <Button
                        className="flex-1"
                        type="tertiary"
                        onClick={() => onImageUpdate(index)}
                      >
                        Izmijeni
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {imageList.length > 0 && (
                <div className="flex gap-2 w-full mt-24">
                  <Button
                    type="black"
                    className="flex-1 flex items-center justify-center"
                    onClick={onImageRemoveAll}
                  >
                    Makni sve slike <BiX fontSize={30} />
                  </Button>

                  <Button
                    type="primary"
                    className="flex-1 flex items-center justify-center"
                    onClick={() => {}}
                  >
                    Spremi sve <BiCheck fontSize={30} />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </ImageUploading>
    </div>
  );
};

export default PhotoUploader;
