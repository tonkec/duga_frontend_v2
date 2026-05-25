import { IImage } from '@app/components/Photos';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useUploadPhotos } from './hooks';
import Button from '@app/components/Button';
import Input from '@app/components/Input';
import { BiTrash } from 'react-icons/bi';
import { removeSpacesAndDashes } from '@app/utils/removeSpacesAndDashes';
import Card from '@app/components/Card';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { useDeletePhoto } from '@app/components/Photos/hooks';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import ConfirmModal from '@app/components/ConfirmModal';
import { ALLOWED_FILE_TYPES, MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import { areValidImageTypes } from '@app/utils/areValidImageTypes';
import BlobImage from './components/BlobImage';
import Image from '../Image';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import EmojiPicker from '@app/components/EmojiPicker';
import data from '@emoji-mart/data';
import { init } from 'emoji-mart';
import {
  getEmojiSearchQueryFromText,
  replaceEmojiToken,
  searchEmojiNatives,
} from '@app/utils/emojis';

export interface ImageDescription {
  description: string;
  imageId: string;
  isProfilePhoto?: boolean;
}

interface IPhotoActionButtonsProps {
  onInputChange: (value: string) => void;
  onDelete: () => void;
  inputValue: string;
  isChecked?: boolean;
  onCheckboxChange?: (e: SyntheticEvent) => void;
  hasCheckbox?: boolean;
  disabled?: boolean;
}

const DESCRIPTION_MAX_LENGTH = 100;

const DeleteButtonModal = ({
  onDelete,
  isOpen,
  onClose,
}: {
  onClose: () => void;
  onDelete: () => void;
  isOpen: boolean;
}) => {
  return (
    <ConfirmModal isOpen={isOpen} onClose={onClose} onConfirm={onDelete}>
      <div>
        <h2 className="text-xl mb-2">Jesi li siguran_na da želiš obrisati fotografiju?</h2>
      </div>
    </ConfirmModal>
  );
};

const normalizeDescription = (raw: string) =>
  raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/gu, '')
    .trim()
    .replace(/\s+/g, ' ');

const getDescriptionLength = (description: string) => Array.from(description).length;

const PhotoActionButtons = ({
  onInputChange,
  onDelete,
  inputValue,
  isChecked,
  onCheckboxChange,
  hasCheckbox,
  disabled,
}: IPhotoActionButtonsProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <>
      <DeleteButtonModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={onDelete}
      />
      <Input
        value={inputValue}
        className="mt-4 h-12 rounded-2xl border-[#dce4ff] bg-white px-4 text-sm shadow-sm"
        placeholder="Napiši nešto o fotografiji ( : za emoji )"
        onChange={(e) => onInputChange(e.target.value)}
        type="text"
        disabled={disabled}
      />
      {hasCheckbox && (
        <label
          className={`mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
            isChecked
              ? 'border-blue bg-blue/10 text-blue'
              : 'border-[#dce4ff] bg-white text-gray-700 hover:bg-[#f0f4ff]'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <input
            type="checkbox"
            disabled={disabled}
            onChange={
              onCheckboxChange
                ? onCheckboxChange
                : (e: SyntheticEvent) => {
                    e.preventDefault();
                  }
            }
            checked={isChecked}
            className="h-4 w-4 rounded border-[#b9c6ff] accent-blue"
          />
          <span>{isChecked ? 'Odabrana profilna fotografija' : 'Postavi kao profilnu'}</span>
        </label>
      )}
      <div className="mt-4 flex gap-2">
        <Button
          type="danger"
          htmlType="button"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold"
          onClick={(e: SyntheticEvent | undefined) => {
            e?.preventDefault();
            setIsDeleteModalOpen(true);
          }}
          disabled={disabled}
        >
          <span>Obriši</span>
          <BiTrash fontSize={20} />
        </Button>
      </div>
    </>
  );
};

const PhotoUploader = () => {
  init({ data });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user: currentUser, isUserLoading: isCurrentUserLoading } = useGetCurrentUser();
  const userId = currentUser?.data?.id;
  const { allUserImages } = useGetAllUserImages();
  const [updatedImageDescriptions, setUpdatedImageDescriptions] = useState<ImageDescription[]>([]);
  const [newImageDescriptions, setNewImageDescriptions] = useState<ImageDescription[]>([]);
  const [hasDescriptionError, setHasDescriptionError] = useState<boolean>(false);
  const [descriptionInputValues, setDescriptionInputValues] = useState<Record<string, string>>({});
  const [activeDescriptionId, setActiveDescriptionId] = useState<string | null>(null);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);
  const { allImages: allExistingImages } = useGetAllImages(userId as string);
  const { deletePhoto } = useDeletePhoto();
  const { onUploadPhotos, isUploadingPhotos } = useUploadPhotos();
  const [newImages, setNewImages] = useState<IImage[]>();
  const [allCheckboxes, setAllCheckboxes] = useState<{ index: number; isProfilePhoto: boolean }[]>(
    []
  );

  useEffect(() => {
    if (allExistingImages && allExistingImages.data.images.length > 0) {
      const checkboxes = allExistingImages.data.images.map((image: IImage, index: number) => {
        return { index, isProfilePhoto: image.isProfilePhoto || false };
      });
      setAllCheckboxes(checkboxes);
    }
  }, [allExistingImages]);

  const handleEmojiSearch = async (descriptionId: string, value: string) => {
    const searchTerm = getEmojiSearchQueryFromText(value);

    if (searchTerm) {
      const emojis = await searchEmojiNatives(searchTerm);
      setActiveDescriptionId(descriptionId);
      setCurrentEmojis(emojis);
      return;
    }

    setActiveDescriptionId(null);
    setCurrentEmojis([]);
  };

  const setDescriptionInputValue = (descriptionId: string, value: string) => {
    setDescriptionInputValues((prev) => ({ ...prev, [descriptionId]: value }));
    handleEmojiSearch(descriptionId, value);
  };

  const isValidDescriptionLength = (description: string) => {
    if (getDescriptionLength(description) <= DESCRIPTION_MAX_LENGTH) {
      setHasDescriptionError(false);
      return true;
    }

    setHasDescriptionError(true);
    toast.error(
      `Opis fotografije ne može biti duži od ${DESCRIPTION_MAX_LENGTH} znakova!`,
      toastConfig
    );
    return false;
  };

  const getDescriptionInputValue = (imageId: string, defaultValue: string) =>
    descriptionInputValues[imageId] ?? defaultValue;

  const applyEmojiToDescriptionInput = (
    descriptionId: string,
    currentValue: string,
    emoji: string
  ) => {
    const updatedValue = replaceEmojiToken(currentValue, emoji);
    setDescriptionInputValues((prev) => ({ ...prev, [descriptionId]: updatedValue }));
    setActiveDescriptionId(null);
    setCurrentEmojis([]);
    return updatedValue;
  };

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault();

    const files = (e.target as HTMLFormElement)?.avatars?.files;

    if (!files || files.length === 0) return;

    if (!areValidImageTypes(files)) {
      toast.error(`Možeš odabrati samo ${ALLOWED_FILE_TYPES} formate`);
      return;
    }

    if (files.length + (allUserImages?.data?.length || 0) > MAXIMUM_NUMBER_OF_IMAGES) {
      toast.error(`Maksimalan broj svih slika je ${MAXIMUM_NUMBER_OF_IMAGES}`);
      return;
    }

    const formData = new FormData();
    formData.append('text', JSON.stringify(newImageDescriptions));
    formData.append('userId', userId as string);

    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      const cleanedName = removeSpacesAndDashes(originalFile.name.toLowerCase().trim());

      const cleanedFile = new File([originalFile], cleanedName, {
        type: originalFile.type,
      });

      formData.append('avatars', cleanedFile);
    }

    onUploadPhotos(formData, {
      onSuccess: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setNewImages([]);
      },
    });
  };

  const onDescriptionChange = (value: string, file: IImage) => {
    const imageId = removeSpacesAndDashes(file.name);
    const description = normalizeDescription(value);

    if (!isValidDescriptionLength(description)) {
      return;
    }

    setDescriptionInputValue(imageId, value);
    setNewImageDescriptions((prevState) => {
      const image = { description, imageId };
      const newState = prevState.filter(
        (item) => removeSpacesAndDashes(item.imageId) !== removeSpacesAndDashes(imageId)
      );
      newState.push(image);
      return newState;
    });
  };

  const onDeleteFromState = (image: IImage) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const imageId = removeSpacesAndDashes(image.name);
    setDescriptionInputValues((prev) => {
      const next = { ...prev };
      delete next[imageId];
      return next;
    });
    setNewImages((prev) =>
      prev?.filter((img) => removeSpacesAndDashes(img.name) !== removeSpacesAndDashes(image.name))
    );
  };

  const onDeleteFromS3 = (image: IImage) => {
    deletePhoto({ url: image.url });
  };

  const onSubmitUpdatePhotos = (e: SyntheticEvent) => {
    e.preventDefault();
    const changedDescriptionsById = new Map(
      updatedImageDescriptions.map((image) => [removeSpacesAndDashes(image.imageId), image])
    );
    const imagesPayload = allExistingImages.data.images.map((image: IImage, index: number) => {
      const imageId = removeSpacesAndDashes(image.name);
      const changedDescription = changedDescriptionsById.get(imageId)?.description;
      const currentDescription = normalizeDescription(
        getDescriptionInputValue(imageId, image.description || '')
      );
      const isProfilePhoto =
        allCheckboxes.find((checkbox) => checkbox.index === index)?.isProfilePhoto || false;

      return {
        description: changedDescription ?? currentDescription,
        imageId,
        isProfilePhoto,
      };
    });

    const formData = new FormData();
    formData.append('text', JSON.stringify(imagesPayload));
    formData.append('userId', userId as string);
    onUploadPhotos(formData);
  };

  const shouldShowEditable = allExistingImages && allExistingImages.data.images.length > 0;

  if (isCurrentUserLoading) {
    return (
      <Card>
        <h2 className="text-xl">Učitavanje...</h2>
      </Card>
    );
  }

  if (!currentUser?.data) {
    return (
      <Card>
        <h2 className="text-xl">Ne možemo učitati tvoje podatke. Molimo pokušaj ponovo kasnije.</h2>
      </Card>
    );
  }

  return (
    <div>
      {isUploadingPhotos && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] px-4 py-3 font-semibold text-blue">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue border-t-transparent" />
          Fotografije se spremaju...
        </div>
      )}
      {shouldShowEditable && (
        <Card className="mb-6 rounded-2xl p-5 md:p-6">
          <form onSubmit={onSubmitUpdatePhotos}>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Tvoje fotografije</h2>
              <p className="mt-1 text-gray-600">Uredi opise i odaberi profilnu fotografiju.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {allExistingImages.data.images.map((image: IImage, index: number) => {
                const imageId = removeSpacesAndDashes(image.name);
                const inputValue = getDescriptionInputValue(imageId, image.description);

                return (
                  <div
                    key={`${image.name}-editable`}
                    className="overflow-hidden rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] p-3 shadow-sm transition-shadow hover:shadow-lg hover:shadow-blue/10"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                      <BlobImage
                        imageUrl={image.securePhotoUrl}
                        name={image.name}
                        className="h-full w-full object-cover"
                      />
                      {allCheckboxes.find((checkbox) => checkbox.index === index)
                        ?.isProfilePhoto && (
                        <span className="absolute left-3 top-3 rounded-full bg-blue px-3 py-1 text-xs font-bold text-white shadow-md">
                          Profilna
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <PhotoActionButtons
                        onInputChange={(value: string) => {
                          const description = normalizeDescription(value);
                          if (!isValidDescriptionLength(description)) {
                            return;
                          }

                          setDescriptionInputValue(imageId, value);
                          setUpdatedImageDescriptions((prev) => {
                            const newImage = { description, imageId };
                            const newState = prev.filter(
                              (item) =>
                                removeSpacesAndDashes(item.imageId) !==
                                removeSpacesAndDashes(imageId)
                            );
                            newState.push(newImage);
                            return newState;
                          });
                        }}
                        onDelete={() => onDeleteFromS3(image)}
                        inputValue={inputValue}
                        isChecked={
                          allCheckboxes.find((checkbox) => checkbox.index === index)
                            ?.isProfilePhoto || false
                        }
                        hasCheckbox
                        disabled={isUploadingPhotos}
                        onCheckboxChange={(e: SyntheticEvent) => {
                          const isChecked = (e.target as HTMLInputElement).checked;
                          setAllCheckboxes((prev) =>
                            prev.map((checkbox) => ({
                              ...checkbox,
                              isProfilePhoto: checkbox.index === index ? isChecked : false,
                            }))
                          );
                          setUpdatedImageDescriptions((prev) => {
                            if (prev.length === 0) {
                              return [
                                {
                                  description: image.description,
                                  imageId,
                                  isProfilePhoto: (e.target as HTMLInputElement).checked,
                                },
                              ];
                            }

                            const newState = prev.map((item) => {
                              if (removeSpacesAndDashes(item.imageId) === imageId) {
                                return { ...item, isProfilePhoto: !item.isProfilePhoto };
                              }
                              return item;
                            });

                            return newState;
                          });
                        }}
                      />
                      {activeDescriptionId === imageId && (
                        <EmojiPicker
                          emojis={currentEmojis}
                          onEmojiSelect={(emoji: string) => {
                            const updatedValue = applyEmojiToDescriptionInput(
                              imageId,
                              inputValue,
                              emoji
                            );
                            const description = normalizeDescription(updatedValue);

                            if (!isValidDescriptionLength(description)) {
                              return;
                            }

                            setUpdatedImageDescriptions((prev) => {
                              const newImage = { description, imageId };
                              const newState = prev.filter(
                                (item) =>
                                  removeSpacesAndDashes(item.imageId) !==
                                  removeSpacesAndDashes(imageId)
                              );
                              newState.push(newImage);
                              return newState;
                            });
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end border-t border-[#dce4ff] pt-4">
              <Button
                type="blue"
                className="w-full rounded-full px-6 py-3 font-semibold shadow-md shadow-blue/15 md:w-auto"
                disabled={hasDescriptionError || isUploadingPhotos}
              >
                <span>{isUploadingPhotos ? 'Spremanje...' : 'Spremi promjene'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="rounded-2xl p-5 md:p-6">
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Dodaj nove fotografije</h2>
            <p className="mt-1 text-gray-600">
              Možeš imati najviše {MAXIMUM_NUMBER_OF_IMAGES} fotografija ukupno.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {newImages &&
              newImages.map((image) => {
                const imageId = removeSpacesAndDashes(image.name);
                const inputValue = getDescriptionInputValue(imageId, image.description);

                return (
                  <div
                    key={image.name}
                    className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-3"
                  >
                    <div className="relative w-full aspect-[1/1] overflow-hidden rounded-xl">
                      <Image
                        src={image.url}
                        alt={image.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      {isUploadingPhotos && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 font-semibold text-white">
                          Spremanje...
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <PhotoActionButtons
                        onInputChange={(value: string) => onDescriptionChange(value, image)}
                        onDelete={() => onDeleteFromState(image)}
                        inputValue={inputValue}
                        disabled={isUploadingPhotos}
                      />
                      {activeDescriptionId === imageId && (
                        <EmojiPicker
                          emojis={currentEmojis}
                          onEmojiSelect={(emoji: string) => {
                            const updatedValue = applyEmojiToDescriptionInput(
                              imageId,
                              inputValue,
                              emoji
                            );
                            onDescriptionChange(updatedValue, image);
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="my-4 rounded-2xl border border-dashed border-[#b9c6ff] bg-[#f7f9ff] p-5">
            <input
              ref={fileInputRef}
              type="file"
              name="avatars"
              multiple
              accept={ALLOWED_FILE_TYPES}
              onChange={(e) => {
                if (e.target.files) {
                  const files = e.target.files;

                  if (
                    files.length +
                      (newImages?.length || 0) +
                      allExistingImages?.data?.images?.length >
                    MAXIMUM_NUMBER_OF_IMAGES
                  ) {
                    toast.error(
                      `Maksimalan broj fotografija je ${MAXIMUM_NUMBER_OF_IMAGES}!`,
                      toastConfig
                    );
                    return;
                  }

                  if (!areValidImageTypes(files)) {
                    toast.error(`Dozvoljeni formati su ${ALLOWED_FILE_TYPES}!`, toastConfig);
                    return;
                  }

                  const images = Array.from(files).map((file) => {
                    return {
                      url: URL.createObjectURL(file),
                      name: file.name,
                      fileType: file.type,
                      description: '',
                      userId: userId as string,
                      isProfilePhoto: false,
                    };
                  });

                  setNewImages((prev) => [...(prev || []), ...(images as IImage[])]);
                }
              }}
              className="w-full cursor-pointer rounded-xl bg-white p-3 text-sm text-gray-700"
              disabled={isUploadingPhotos}
            />
          </div>
          {newImages && newImages.length > 0 && (
            <Button
              type="blue"
              className="w-full md:w-auto"
              disabled={hasDescriptionError || isUploadingPhotos}
            >
              <span>{isUploadingPhotos ? 'Spremanje...' : 'Spremi'}</span>
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
};

export default PhotoUploader;
