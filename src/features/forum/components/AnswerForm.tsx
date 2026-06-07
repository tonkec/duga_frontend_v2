import { FormEvent, useState } from 'react';
import Button from '@app/components/Button';
import type { CreateAnswerPayload } from '../types/forum.types';
import EmojiPicker from '@app/components/EmojiPicker';
import EmojiSearch from '@app/components/EmojiSearch';
import FileUploadInput from '@app/components/FileUploadInput';
import GiphySearch from '@app/components/GiphySearch';
import Image from '@app/components/Image';
import MentionInput from '@app/components/MentionInput';
import { BiImageAdd, BiSmile, BiSolidFileGif } from 'react-icons/bi';
import data from '@emoji-mart/data';
import { init } from 'emoji-mart';
import {
  getEmojiSearchQueryFromText,
  replaceEmojiToken,
  searchEmojiNatives,
} from '@app/utils/emojis';
import {
  FORUM_ALLOWED_IMAGE_TYPES,
  FORUM_MAX_BODY_LENGTH,
  validateForumImages,
} from '../utils/forumValidation';
import { useObjectUrls } from '@app/hooks/useObjectUrl';
import { getSafeRemoteImageUrl } from '@app/utils/mediaSafety';

interface AnswerFormProps {
  isSubmitting: boolean;
  onSubmit: (payload: CreateAnswerPayload) => void;
}

const ANSWER_MAX_LENGTH = FORUM_MAX_BODY_LENGTH;

const AnswerForm = ({ isSubmitting, onSubmit }: AnswerFormProps) => {
  init({ data });

  const [body, setBody] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<Array<{ id: number; username: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);
  const [showEmojiSearch, setShowEmojiSearch] = useState(false);
  const [showGiphySearch, setShowGiphySearch] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const imagePreviewUrls = useObjectUrls(images);

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

    const trimmedBody = body.trim();
    if (!trimmedBody && !selectedGifUrl && images.length === 0) {
      setError('Odgovor je obavezan.');
      return;
    }

    if (trimmedBody && trimmedBody.length < 2) {
      setError('Odgovor mora imati barem 2 znaka.');
      return;
    }

    if (trimmedBody.length > ANSWER_MAX_LENGTH) {
      setError(`Odgovor može imati najviše ${ANSWER_MAX_LENGTH} znakova.`);
      return;
    }

    const imageError = validateForumImages(images);
    if (imageError) {
      setError(imageError);
      return;
    }

    const bodyWithGif = selectedGifUrl
      ? [trimmedBody, selectedGifUrl].filter(Boolean).join(' ')
      : trimmedBody;

    setError(null);
    onSubmit({
      body: bodyWithGif,
      images,
      taggedUserIds: taggedUsers.map((user) => Number(user.id)),
    });
    setBody('');
    setTaggedUsers([]);
    setImages([]);
    setSelectedGifUrl('');
    setCurrentEmojis([]);
    setShowEmojiSearch(false);
    setShowGiphySearch(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm"
      data-testid="forum-answer-form"
    >
      <label htmlFor="answer-body" className="text-sm font-bold text-gray-950">
        Tvoj odgovor
      </label>
      <MentionInput
        value={body}
        onChange={updateBody}
        onTagUsersChange={setTaggedUsers}
        initialTaggedUsers={taggedUsers}
        rows={5}
        maxLength={ANSWER_MAX_LENGTH}
        className="mt-2"
        textareaClassName="text-sm"
        placeholder="Napiši odgovor... Upiši @ za označavanje osobe ili : za brzi emoji."
        data-testid="forum-answer-body"
      />
      <p className="mt-1 text-right text-xs text-gray-400">
        {body.length}/{ANSWER_MAX_LENGTH}
      </p>
      <EmojiPicker
        emojis={currentEmojis}
        onEmojiSelect={(emoji) => {
          setBody((currentBody) => replaceEmojiToken(currentBody, emoji));
          setCurrentEmojis([]);
        }}
      />
      {error && <p className="mt-2 text-sm font-medium text-red">{error}</p>}

      <div className="mt-4">
        <label
          htmlFor="answer-image"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-950"
        >
          <BiImageAdd size={18} className="text-blue" />
          Slika (opcionalno)
        </label>
        <FileUploadInput
          id="answer-image"
          accept={FORUM_ALLOWED_IMAGE_TYPES}
          multiple
          label="Odaberi slike"
          helperText={`Podržani formati su ${FORUM_ALLOWED_IMAGE_TYPES}. Maksimalno 5 slika, do 1 MB po slici.`}
          onChange={(event) => {
            const selectedImages = Array.from(event.target.files ?? []);
            setImages(selectedImages);
            setError(validateForumImages(selectedImages) || null);
          }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
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

        <Button
          type="blue"
          htmlType="submit"
          className="rounded-full px-6 py-3 font-semibold"
          disabled={isSubmitting}
          data-testid="forum-answer-submit"
        >
          {isSubmitting ? 'Šaljem...' : 'Pošalji odgovor'}
        </Button>
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
        onGifSelect={(gifUrl) => {
          const safeGifUrl = getSafeRemoteImageUrl(gifUrl);
          if (safeGifUrl) setSelectedGifUrl(safeGifUrl);
        }}
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
      {imagePreviewUrls.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-3 sm:grid-cols-2">
            {imagePreviewUrls.map((previewUrl, index) => (
              <Image
                key={`${previewUrl}-${index}`}
                src={previewUrl}
                alt={`Pregled slike odgovora ${index + 1}`}
                className="max-w-[180px] rounded-xl border border-[#dce4ff]"
              />
            ))}
          </div>
          <Button
            type="danger"
            htmlType="button"
            onClick={() => setImages([])}
            disabled={isSubmitting}
          >
            Makni
          </Button>
        </div>
      )}
    </form>
  );
};

export default AnswerForm;
