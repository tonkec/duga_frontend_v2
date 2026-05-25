import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BiCheckCircle,
  BiDotsVerticalRounded,
  BiEdit,
  BiFlag,
  BiImageAdd,
  BiTrash,
  BiXCircle,
} from 'react-icons/bi';
import Button from '@app/components/Button';
import ConfirmModal from '@app/components/ConfirmModal';
import FileUploadInput from '@app/components/FileUploadInput';
import Image from '@app/components/Image';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';
import type { Answer, UpdateAnswerPayload } from '../types/forum.types';
import VoteControls, { getVoteScore } from './VoteControls';
import ContentFormatter from '@app/components/ContentFormatter';
import ForumImageGallery from './ForumImageGallery';

interface AnswerCardProps {
  answer: Answer;
  canAccept: boolean;
  hasAcceptedAnswer: boolean;
  currentUserId?: number;
  isAccepting: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  isVotePending: boolean;
  onAccept: (answerId: number) => void;
  onDelete: (answerId: number) => void;
  onUpdate: (answerId: number, payload: UpdateAnswerPayload) => void;
  onVote: (answerId: number, value: 1 | -1) => void;
  onClearVote: (answerId: number) => void;
}

const ANSWER_MIN_LENGTH = 2;
const ANSWER_MAX_LENGTH = 2000;

const getAuthorName = (answer: Answer) => answer.User?.name || answer.User?.username || 'Korisnik';

const getAuthorId = (answer: Answer) => answer.User?.id ?? answer.userId;

const AnswerCard = ({
  answer,
  canAccept,
  hasAcceptedAnswer,
  currentUserId,
  isAccepting,
  isDeleting,
  isUpdating,
  isVotePending,
  onAccept,
  onDelete,
  onUpdate,
  onVote,
  onClearVote,
}: AnswerCardProps) => {
  const isOwnAnswer = currentUserId === (answer.userId ?? answer.User?.id ?? answer.user?.id);
  const authorId = getAuthorId(answer);
  const authorName = getAuthorName(answer);
  const voteScore = getVoteScore(answer);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [draftBody, setDraftBody] = useState(answer.body);
  const [draftImages, setDraftImages] = useState<File[]>([]);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const draftImagePreviewUrls = draftImages.map((image) => URL.createObjectURL(image));
  const hasExistingImage = Boolean(
    answer.securePhotoUrl ||
      answer.imageUrl ||
      answer.securePhotoUrls?.length ||
      answer.imageUrls?.length
  );
  const shouldShowExistingImage =
    hasExistingImage && draftImagePreviewUrls.length === 0 && !removeExistingImage;

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftBody(answer.body);
    setDraftImages([]);
    setRemoveExistingImage(false);
    setEditError(null);
  };

  const handleSubmitEdit = () => {
    const trimmedDraftBody = draftBody.trim();

    if (trimmedDraftBody.length < ANSWER_MIN_LENGTH) {
      setEditError(`Odgovor mora imati barem ${ANSWER_MIN_LENGTH} znaka.`);
      return;
    }

    if (trimmedDraftBody.length > ANSWER_MAX_LENGTH) {
      setEditError(`Odgovor može imati najviše ${ANSWER_MAX_LENGTH} znakova.`);
      return;
    }

    setEditError(null);
    onUpdate(answer.id, {
      body: trimmedDraftBody,
      images: draftImages,
      removeImage: removeExistingImage || undefined,
    });
    setIsEditing(false);
    setDraftImages([]);
    setRemoveExistingImage(false);
  };

  const handleDelete = () => {
    onDelete(answer.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <article
      className={`rounded-3xl border p-5 shadow-sm ${
        answer.isAccepted
          ? 'border-green/40 bg-green/5 ring-2 ring-green/10'
          : 'border-[#dce4ff] bg-white'
      }`}
    >
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      >
        <h2 className="text-xl font-bold text-gray-950">Obrisati odgovor?</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Ova radnja će trajno ukloniti tvoj odgovor s pitanja.
        </p>
      </ConfirmModal>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/user/${authorId}`} className="shrink-0">
            <UserAvatar
              avatarFallbackName={authorName}
              color="#2D46B9"
              userId={String(authorId)}
              size="40"
              className="h-10 w-10 rounded-full"
            />
          </Link>
          <div>
            <Link to={`/user/${authorId}`} className="font-bold text-blue underline">
              {authorName}
            </Link>
            <RecordCreatedAt createdAt={answer.createdAt} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {answer.isAccepted && (
            <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">
              Prihvaćen odgovor
            </span>
          )}
          <span className="rounded-full bg-[#f7f9ff] px-2.5 py-1 text-xs font-semibold text-blue-dark">
            {voteScore} glasova
          </span>
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm shadow-blue-dark/5 transition-colors hover:border-blue hover:text-blue"
              onClick={() => setIsActionsOpen((isOpen) => !isOpen)}
              aria-expanded={isActionsOpen}
              aria-haspopup="menu"
            >
              Akcije
              <BiDotsVerticalRounded size={16} />
            </button>

            {isActionsOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-20 w-60 rounded-2xl border border-[#dce4ff] bg-white p-2 text-sm shadow-xl shadow-blue-dark/10"
              >
                {!isOwnAnswer && (
                  <div className="mb-2 rounded-xl bg-[#f7f9ff] p-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Glasanje
                    </p>
                    <VoteControls
                      item={answer}
                      isPending={isVotePending}
                      onVote={(value) => onVote(answer.id, value)}
                      onClearVote={() => onClearVote(answer.id)}
                      className="w-full justify-center"
                    />
                  </div>
                )}

                {canAccept && (!hasAcceptedAnswer || answer.isAccepted) && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-gray-700 transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isAccepting}
                    onClick={() => {
                      setIsActionsOpen(false);
                      onAccept(answer.id);
                    }}
                  >
                    {answer.isAccepted ? <BiXCircle size={20} /> : <BiCheckCircle size={20} />}
                    {answer.isAccepted ? 'Odbaci odgovor' : 'Prihvati odgovor'}
                  </button>
                )}

                {isOwnAnswer && !isEditing && (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-gray-700 transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isUpdating || isDeleting}
                      onClick={() => {
                        setIsActionsOpen(false);
                        setIsEditing(true);
                      }}
                    >
                      <BiEdit size={20} />
                      Uredi
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red transition-colors hover:bg-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isDeleting}
                      onClick={() => {
                        setIsActionsOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <BiTrash size={20} />
                      {isDeleting ? 'Brišem...' : 'Obriši'}
                    </button>
                  </>
                )}

                <Link
                  to="/report"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red transition-colors hover:bg-red/10"
                  onClick={() => setIsActionsOpen(false)}
                >
                  <BiFlag size={20} />
                  Prijavi
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={draftBody}
            onChange={(event) => {
              setDraftBody(event.target.value);
              setEditError(null);
            }}
            rows={5}
            maxLength={ANSWER_MAX_LENGTH}
            className="w-full rounded-2xl border border-[#dce4ff] px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-blue"
          />
          <div className="mt-4">
            <label
              htmlFor={`answer-edit-image-${answer.id}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-950"
            >
              <BiImageAdd size={18} className="text-blue" />
              Slika (opcionalno)
            </label>
            <FileUploadInput
              id={`answer-edit-image-${answer.id}`}
              accept="image/*"
              multiple
              label="Odaberi sliku"
              helperText="Odaberi nove slike ako želiš zamijeniti postojeće. Maksimalno 5 slika, do 1 MB po slici."
              onChange={(event) => {
                setDraftImages(Array.from(event.target.files ?? []));
                setRemoveExistingImage(false);
              }}
            />
          </div>
          {(shouldShowExistingImage || draftImagePreviewUrls.length > 0) && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  {draftImagePreviewUrls.length > 0 ? 'Nove slike' : 'Trenutne slike'}
                </p>
                {draftImagePreviewUrls.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {draftImagePreviewUrls.map((previewUrl, index) => (
                      <Image
                        key={`${previewUrl}-${index}`}
                        src={previewUrl}
                        alt={`Pregled nove slike odgovora ${index + 1}`}
                        className="max-w-[180px] rounded-xl border border-[#dce4ff]"
                      />
                    ))}
                  </div>
                ) : (
                  <ForumImageGallery
                    item={answer}
                    alt="Trenutna slika odgovora"
                    imageClassName="max-w-[180px] rounded-xl border border-[#dce4ff]"
                  />
                )}
              </div>
              {draftImagePreviewUrls.length > 0 && (
                <Button
                  type="danger"
                  htmlType="button"
                  onClick={() => setDraftImages([])}
                  disabled={isUpdating}
                >
                  Makni
                </Button>
              )}
              {shouldShowExistingImage && (
                <Button
                  type="danger"
                  htmlType="button"
                  onClick={() => setRemoveExistingImage(true)}
                  disabled={isUpdating}
                >
                  Makni postojeću
                </Button>
              )}
            </div>
          )}
          {removeExistingImage && (
            <p className="mt-4 rounded-2xl bg-red/10 px-4 py-3 text-sm font-medium text-red">
              Postojeća slika bit će uklonjena nakon spremanja.
            </p>
          )}
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {editError && <p className="text-sm font-medium text-red">{editError}</p>}
              <p className="text-xs text-gray-400">
                {draftBody.length}/{ANSWER_MAX_LENGTH}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="secondary"
                htmlType="button"
                className="rounded-full border border-[#dce4ff] px-4 py-2"
                disabled={isUpdating}
                onClick={handleCancelEdit}
              >
                Odustani
              </Button>
              <Button
                type="blue"
                htmlType="button"
                className="rounded-full px-4 py-2"
                disabled={isUpdating}
                onClick={handleSubmitEdit}
              >
                {isUpdating ? 'Spremam...' : 'Spremi'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="whitespace-pre-wrap text-base leading-8 text-gray-800">
            <ContentFormatter text={answer.body} />
          </div>
          <ForumImageGallery
            item={answer}
            alt="Slika odgovora"
            className="mt-4"
            imageClassName="max-w-full rounded-2xl border border-[#dce4ff]"
          />
        </>
      )}
    </article>
  );
};

export default AnswerCard;
