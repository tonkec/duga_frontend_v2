import { FormEvent, useState } from 'react';
import Button from '@app/components/Button';
import EmojiPicker from '@app/components/EmojiPicker';
import EmojiSearch from '@app/components/EmojiSearch';
import FileUploadInput from '@app/components/FileUploadInput';
import GiphySearch from '@app/components/GiphySearch';
import Image from '@app/components/Image';
import MentionInput from '@app/components/MentionInput';
import { BiSmile, BiSolidFileGif } from 'react-icons/bi';
import data from '@emoji-mart/data';
import { init } from 'emoji-mart';
import type { CreateQuestionPayload, Question, UpdateQuestionPayload } from '../types/forum.types';
import {
  getEmojiSearchQueryFromText,
  replaceEmojiToken,
  searchEmojiNatives,
} from '@app/utils/emojis';
import ForumImageGallery from './ForumImageGallery';
import { FORUM_MAX_BODY_LENGTH, validateForumImages } from '../utils/forumValidation';
import { getForumImageItems } from '../utils/forumImages';

type QuestionFormPayload = CreateQuestionPayload & Pick<UpdateQuestionPayload, 'removeImage'>;

interface QuestionFormProps {
  initialQuestion?: Question;
  isDeletingExistingImage?: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  onDeleteExistingImage?: () => void;
  onSubmit: (payload: QuestionFormPayload) => void;
  submitLabel?: string;
  submittingLabel?: string;
}

interface QuestionFormErrors {
  title?: string;
  body?: string;
  images?: string;
}

const validateQuestionForm = (
  title: string,
  body: string,
  images: File[],
  existingImageCount: number
): QuestionFormErrors => {
  const errors: QuestionFormErrors = {};

  if (!title) {
    errors.title = 'Naslov je obavezan.';
  } else if (title.length < 5) {
    errors.title = 'Naslov mora imati barem 5 znakova.';
  } else if (title.length > 120) {
    errors.title = 'Naslov može imati najviše 120 znakova.';
  }

  if (!body) {
    errors.body = 'Opis je obavezan.';
  } else if (body.length < 10) {
    errors.body = 'Opis mora imati barem 10 znakova.';
  } else if (body.length > FORUM_MAX_BODY_LENGTH) {
    errors.body = `Opis može imati najviše ${FORUM_MAX_BODY_LENGTH} znakova.`;
  }

  const imageError = validateForumImages(images, existingImageCount);
  if (imageError) {
    errors.images = imageError;
  }

  return errors;
};

const QuestionForm = ({
  initialQuestion,
  isDeletingExistingImage = false,
  isSubmitting,
  onCancel,
  onDeleteExistingImage,
  onSubmit,
  submitLabel = 'Objavi pitanje',
  submittingLabel = 'Objavljujem...',
}: QuestionFormProps) => {
  init({ data });

  const [title, setTitle] = useState(initialQuestion?.title ?? '');
  const [body, setBody] = useState(initialQuestion?.body ?? '');
  const [taggedUsers, setTaggedUsers] = useState<Array<{ id: number; username: string }>>(
    initialQuestion?.taggedUsers
      ?.filter((user) => user.username)
      .map((user) => ({ id: user.id, username: user.username as string })) ?? []
  );
  const [images, setImages] = useState<File[]>([]);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);
  const [showEmojiSearch, setShowEmojiSearch] = useState(false);
  const [showGiphySearch, setShowGiphySearch] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState('');
  const [errors, setErrors] = useState<QuestionFormErrors>({});
  const imagePreviewUrls = images.map((image) => URL.createObjectURL(image));
  const hasExistingImage = Boolean(
    initialQuestion?.securePhotoUrl ||
      initialQuestion?.imageUrl ||
      initialQuestion?.securePhotoUrls?.length ||
      initialQuestion?.imageUrls?.length
  );
  const shouldShowExistingImage =
    hasExistingImage && imagePreviewUrls.length === 0 && !removeExistingImage;
  const existingImageCount =
    initialQuestion && !removeExistingImage ? getForumImageItems(initialQuestion).length : 0;

  const updateBody = async (value: string) => {
    setBody(value);

    const searchTerm = getEmojiSearchQueryFromText(value);
    if (!searchTerm) {
      setCurrentEmojis([]);
      return;
    }

    const emojis = await searchEmojiNatives(searchTerm);
    setCurrentEmojis(emojis);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const bodyWithGif = selectedGifUrl
      ? [trimmedBody, selectedGifUrl].filter(Boolean).join(' ')
      : trimmedBody;
    const nextErrors = validateQuestionForm(trimmedTitle, bodyWithGif, images, existingImageCount);

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      title: trimmedTitle,
      body: bodyWithGif,
      images,
      taggedUserIds: taggedUsers.map((user) => Number(user.id)),
    });
    setSelectedGifUrl('');
    setCurrentEmojis([]);
    setShowEmojiSearch(false);
    setShowGiphySearch(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm md:p-6"
    >
      <div>
        <label htmlFor="question-title" className="text-sm font-bold text-gray-950">
          Naslov
        </label>
        <input
          id="question-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#dce4ff] px-4 py-3 text-sm outline-none transition-colors focus:border-blue"
          maxLength={120}
          placeholder="Ukratko opiši pitanje"
        />
        {errors.title && <p className="mt-2 text-sm font-medium text-red">{errors.title}</p>}
      </div>

      <div className="mt-5">
        <label htmlFor="question-body" className="text-sm font-bold text-gray-950">
          Opis
        </label>
        <MentionInput
          value={body}
          onChange={updateBody}
          onTagUsersChange={setTaggedUsers}
          initialTaggedUsers={taggedUsers}
          rows={8}
          maxLength={FORUM_MAX_BODY_LENGTH}
          className="mt-2"
          textareaClassName="text-sm"
          placeholder="Dodaj kontekst, što si već pokušao_la i kakvu pomoć trebaš. Upiši @ za označavanje osobe ili : za brzi emoji."
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {body.length}/{FORUM_MAX_BODY_LENGTH}
        </p>
        <EmojiPicker
          emojis={currentEmojis}
          onEmojiSelect={(emoji) => {
            setBody((currentBody) => replaceEmojiToken(currentBody, emoji));
            setCurrentEmojis([]);
          }}
        />
        {errors.body && <p className="mt-2 text-sm font-medium text-red">{errors.body}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            setShowEmojiSearch((isOpen) => !isOpen);
            setShowGiphySearch(false);
            setCurrentEmojis([]);
          }}
          disabled={isSubmitting}
        >
          <BiSmile size={20} />
          Emoji
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            setShowGiphySearch((isOpen) => !isOpen);
            setShowEmojiSearch(false);
          }}
          disabled={isSubmitting}
        >
          <BiSolidFileGif size={20} />
          GIF
        </button>
      </div>

      <EmojiSearch
        isOpen={showEmojiSearch}
        onClose={() => setShowEmojiSearch(false)}
        onEmojiSelect={(emoji) => {
          setBody((currentBody) => `${currentBody}${emoji}`);
        }}
      />
      <GiphySearch
        isOpen={showGiphySearch}
        onClose={() => setShowGiphySearch(false)}
        onGifSelect={(gifUrl) => setSelectedGifUrl(gifUrl)}
      />

      {selectedGifUrl && (
        <div className="mt-4 flex items-end gap-3">
          <Image
            src={selectedGifUrl}
            alt="Odabrani GIF"
            className="max-w-[180px] rounded-xl border border-[#dce4ff]"
          />
          <Button
            type="danger"
            htmlType="button"
            onClick={() => setSelectedGifUrl('')}
            disabled={isSubmitting}
          >
            Makni
          </Button>
        </div>
      )}

      <div className="mt-5">
        <label htmlFor="question-image" className="text-sm font-bold text-gray-950">
          Slika (opcionalno)
        </label>
        <FileUploadInput
          id="question-image"
          accept="image/*"
          containerClassName="py-5"
          multiple
          label="Odaberi slike"
          helperText="Podržane su slikovne datoteke. Maksimalno 5 slika, do 1 MB po slici."
          onChange={(event) => {
            const selectedImages = Array.from(event.target.files ?? []);
            const currentExistingImageCount = initialQuestion
              ? getForumImageItems(initialQuestion).length
              : 0;
            setImages(selectedImages);
            setRemoveExistingImage(false);
            setErrors((currentErrors) => ({
              ...currentErrors,
              images: validateForumImages(selectedImages, currentExistingImageCount) || undefined,
            }));
          }}
        />
        {errors.images && <p className="mt-2 text-sm font-medium text-red">{errors.images}</p>}
        {(imagePreviewUrls.length > 0 || shouldShowExistingImage) && (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                {imagePreviewUrls.length > 0 ? 'Nove slike' : 'Trenutne slike'}
              </p>
              {imagePreviewUrls.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {imagePreviewUrls.map((previewUrl, index) => (
                    <Image
                      key={`${previewUrl}-${index}`}
                      src={previewUrl}
                      alt={`Pregled slike pitanja ${index + 1}`}
                      className="max-w-[180px] rounded-xl border border-[#dce4ff]"
                    />
                  ))}
                </div>
              ) : (
                <ForumImageGallery
                  item={initialQuestion as Question}
                  alt="Trenutna slika pitanja"
                  imageClassName="max-w-[180px] rounded-xl border border-[#dce4ff]"
                />
              )}
            </div>
            {imagePreviewUrls.length > 0 && (
              <Button type="danger" htmlType="button" onClick={() => setImages([])}>
                Makni
              </Button>
            )}
            {shouldShowExistingImage && (
              <Button
                type="danger"
                htmlType="button"
                onClick={() => {
                  onDeleteExistingImage?.();
                  setRemoveExistingImage(true);
                }}
                disabled={isSubmitting || isDeletingExistingImage}
              >
                {isDeletingExistingImage ? 'Miči...' : 'Makni postojeću'}
              </Button>
            )}
          </div>
        )}
        {removeExistingImage && (
          <p className="mt-3 rounded-2xl bg-red/10 px-4 py-3 text-sm font-medium text-red">
            Postojeća slika se uklanja.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="secondary"
            htmlType="button"
            className="rounded-full border border-[#dce4ff] px-6 py-3 font-semibold"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Odustani
          </Button>
        )}
        <Button
          type="blue"
          htmlType="submit"
          className="rounded-full px-6 py-3 font-semibold shadow-lg shadow-blue/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
