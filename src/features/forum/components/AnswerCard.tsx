import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BiCheckCircle,
  BiChevronDown,
  BiChevronUp,
  BiDotsVerticalRounded,
  BiEdit,
  BiFlag,
  BiImageAdd,
  BiMessageRoundedDots,
  BiTrash,
  BiXCircle,
} from 'react-icons/bi';
import Button from '@app/components/Button';
import ConfirmModal from '@app/components/ConfirmModal';
import FileUploadInput from '@app/components/FileUploadInput';
import Image from '@app/components/Image';
import MentionInput from '@app/components/MentionInput';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';
import type {
  Answer,
  AnswerReply,
  AnswerReplyPayload,
  UpdateAnswerPayload,
} from '../types/forum.types';
import ContentFormatter from '@app/components/ContentFormatter';
import ForumImageGallery from './ForumImageGallery';
import {
  FORUM_ALLOWED_IMAGE_TYPES,
  FORUM_MAX_BODY_LENGTH,
  validateForumImages,
} from '../utils/forumValidation';
import { getForumImageItems } from '../utils/forumImages';
import { getForumUserAvatarProfilePhoto } from '../utils/forumUserAvatar';
import { getUserProfilePath } from '@app/utils/userProfilePath';
import { useObjectUrls } from '@app/hooks/useObjectUrl';

interface AnswerCardProps {
  answer: Answer;
  canAccept: boolean;
  hasAcceptedAnswer: boolean;
  currentUserId?: number;
  isAccepting: boolean;
  isDeletingImage: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  isReactionPending: boolean;
  isReplyPending: boolean;
  isReplyReactionPending: boolean;
  onAccept: (answerId: number) => void;
  onDelete: (answerId: number) => void;
  onDeleteImage: (answerId: number) => void;
  onUpdate: (answerId: number, payload: UpdateAnswerPayload) => void;
  onAddReaction: (answerId: number, emoji: string) => void;
  onDeleteReaction: (answerId: number, emoji: string) => void;
  onCreateReply: (answerId: number, payload: AnswerReplyPayload) => void;
  onUpdateReply: (replyId: number, payload: AnswerReplyPayload) => void;
  onDeleteReply: (replyId: number) => void;
  onAddReplyReaction: (replyId: number, emoji: string) => void;
  onDeleteReplyReaction: (replyId: number, emoji: string) => void;
}

const ANSWER_MIN_LENGTH = 2;
const ANSWER_MAX_LENGTH = FORUM_MAX_BODY_LENGTH;
const ANSWER_REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🙏'];

const getAuthorName = (answer: Answer) => answer.User?.name || answer.User?.username || 'Korisnik';

const getAuthorId = (answer: Answer) => answer.User?.id ?? answer.userId;
const getAuthorPublicId = (answer: Answer) => answer.User?.publicId ?? answer.user?.publicId;

const getReplyAuthorName = (reply: AnswerReply) =>
  reply.User?.name ||
  reply.User?.username ||
  reply.user?.name ||
  reply.user?.username ||
  'Korisnik';

const getReplyAuthorId = (reply: AnswerReply) => reply.User?.id ?? reply.user?.id ?? reply.userId;
const getReplyAuthorPublicId = (reply: AnswerReply) => reply.User?.publicId ?? reply.user?.publicId;

const hasCurrentUserReacted = (
  reaction: NonNullable<Answer['reactions']>[number] | undefined,
  currentUserId?: number,
  userReactions: string[] = []
) => {
  return Boolean(
    userReactions.includes(reaction?.emoji ?? '') ||
      reaction?.reactedByCurrentUser ||
      reaction?.currentUserReacted ||
      reaction?.hasReacted ||
      (currentUserId && reaction?.userIds?.includes(currentUserId)) ||
      (currentUserId && reaction?.users?.some((user) => user.id === currentUserId))
  );
};

const AnswerCard = ({
  answer,
  canAccept,
  hasAcceptedAnswer,
  currentUserId,
  isAccepting,
  isDeletingImage,
  isDeleting,
  isUpdating,
  isReactionPending,
  isReplyPending,
  isReplyReactionPending,
  onAccept,
  onDelete,
  onDeleteImage,
  onUpdate,
  onAddReaction,
  onDeleteReaction,
  onCreateReply,
  onUpdateReply,
  onDeleteReply,
  onAddReplyReaction,
  onDeleteReplyReaction,
}: AnswerCardProps) => {
  const isOwnAnswer = currentUserId === (answer.userId ?? answer.User?.id ?? answer.user?.id);
  const authorId = getAuthorId(answer);
  const authorPublicId = getAuthorPublicId(answer);
  const authorName = getAuthorName(answer);
  const authorProfilePhoto = getForumUserAvatarProfilePhoto(answer.User || answer.user);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [draftBody, setDraftBody] = useState(answer.body);
  const [draftTaggedUsers, setDraftTaggedUsers] = useState<Array<{ id: number; username: string }>>(
    answer.taggedUsers
      ?.filter((user) => user.username)
      .map((user) => ({ id: user.id, username: user.username as string })) ?? []
  );
  const [draftImages, setDraftImages] = useState<File[]>([]);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editingReplyBody, setEditingReplyBody] = useState('');
  const [replyIdPendingDelete, setReplyIdPendingDelete] = useState<number | null>(null);
  const [isRepliesCollapsed, setIsRepliesCollapsed] = useState(false);
  const [replyReactionDropdownId, setReplyReactionDropdownId] = useState<number | null>(null);
  const draftImagePreviewUrls = useObjectUrls(draftImages);
  const hasExistingImage = Boolean(
    answer.securePhotoUrl ||
      answer.imageUrl ||
      answer.securePhotoUrls?.length ||
      answer.imageUrls?.length
  );
  const shouldShowExistingImage =
    hasExistingImage && draftImagePreviewUrls.length === 0 && !removeExistingImage;
  const existingImageCount = removeExistingImage ? 0 : getForumImageItems(answer).length;
  const replyCount = answer.replies?.length ?? 0;

  useEffect(() => {
    if (!isActionsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionsOpen]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftBody(answer.body);
    setDraftTaggedUsers(
      answer.taggedUsers
        ?.filter((user) => user.username)
        .map((user) => ({ id: user.id, username: user.username as string })) ?? []
    );
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

    const imageError = validateForumImages(draftImages, existingImageCount);
    if (imageError) {
      setEditError(imageError);
      return;
    }

    setEditError(null);
    onUpdate(answer.id, {
      body: trimmedDraftBody,
      images: draftImages,
      taggedUserIds: draftTaggedUsers.map((user) => Number(user.id)),
    });
    setIsEditing(false);
    setDraftImages([]);
    setRemoveExistingImage(false);
  };

  const handleDelete = () => {
    onDelete(answer.id);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteReply = () => {
    if (!replyIdPendingDelete) return;

    onDeleteReply(replyIdPendingDelete);
    setReplyIdPendingDelete(null);
  };

  const handleSubmitReply = () => {
    const trimmedReplyBody = replyBody.trim();
    if (trimmedReplyBody.length < ANSWER_MIN_LENGTH) {
      setReplyError(`Odgovor mora imati barem ${ANSWER_MIN_LENGTH} znaka.`);
      return;
    }

    setReplyError(null);
    onCreateReply(answer.id, { body: trimmedReplyBody });
    setReplyBody('');
    setIsReplyFormOpen(false);
  };

  const handleSubmitReplyEdit = (replyId: number) => {
    const trimmedReplyBody = editingReplyBody.trim();
    if (trimmedReplyBody.length < ANSWER_MIN_LENGTH) {
      setReplyError(`Odgovor mora imati barem ${ANSWER_MIN_LENGTH} znaka.`);
      return;
    }

    setReplyError(null);
    onUpdateReply(replyId, { body: trimmedReplyBody });
    setEditingReplyId(null);
    setEditingReplyBody('');
  };

  return (
    <article
      data-testid="forum-answer-card"
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
      <ConfirmModal
        isOpen={replyIdPendingDelete !== null}
        onClose={() => setReplyIdPendingDelete(null)}
        onConfirm={handleDeleteReply}
      >
        <h2 className="text-xl font-bold text-gray-950">Obrisati odgovor na odgovor?</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Ova radnja će trajno ukloniti tvoj odgovor iz rasprave.
        </p>
      </ConfirmModal>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={getUserProfilePath({ id: authorId, publicId: authorPublicId })}
            className="shrink-0"
          >
            <UserAvatar
              avatarFallbackName={authorName}
              color="#eef3ff"
              fgColor="#2D46B9"
              userId={String(authorId)}
              size="40"
              className="h-10 w-10 rounded-full border border-[#dce4ff]"
              profilePhoto={authorProfilePhoto}
            />
          </Link>
          <div>
            <Link
              to={getUserProfilePath({ id: authorId, publicId: authorPublicId })}
              className="font-bold text-blue underline"
            >
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
          <div className="relative" ref={actionsDropdownRef}>
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
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-gray-700 transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!currentUserId || isReplyPending}
                  onClick={() => {
                    setIsActionsOpen(false);
                    setIsReplyFormOpen(true);
                  }}
                >
                  <BiMessageRoundedDots size={20} />
                  Odgovori
                </button>

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

                <div className="my-1 border-t border-[#dce4ff]" />
                <div className="px-3 py-2">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
                    Reakcije
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ANSWER_REACTION_EMOJIS.map((emoji) => {
                      const reaction = answer.reactions?.find((item) => item.emoji === emoji);
                      const hasReacted = hasCurrentUserReacted(reaction, currentUserId);
                      const count = reaction?.count ?? 0;

                      return (
                        <button
                          key={emoji}
                          type="button"
                          disabled={isReactionPending || !currentUserId}
                          onClick={() => {
                            if (hasReacted) {
                              onDeleteReaction(answer.id, emoji);
                            } else {
                              onAddReaction(answer.id, emoji);
                            }
                          }}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            hasReacted
                              ? 'border-blue bg-blue text-white'
                              : 'border-[#dce4ff] bg-white text-gray-700 hover:border-blue hover:text-blue'
                          }`}
                          aria-label={`${hasReacted ? 'Makni' : 'Dodaj'} reakciju ${emoji}`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="tabular-nums">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!isOwnAnswer && (
                  <Link
                    to="/report"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red transition-colors hover:bg-red/10"
                    onClick={() => setIsActionsOpen(false)}
                  >
                    <BiFlag size={20} />
                    Prijavi
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div>
          <MentionInput
            value={draftBody}
            onChange={(value) => {
              setDraftBody(value);
              setEditError(null);
            }}
            onTagUsersChange={setDraftTaggedUsers}
            initialTaggedUsers={draftTaggedUsers}
            rows={5}
            maxLength={ANSWER_MAX_LENGTH}
            textareaClassName="text-sm"
          />
          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            {editError && <p className="text-sm font-medium text-red">{editError}</p>}
            <p className="text-xs text-gray-400">
              {draftBody.length}/{ANSWER_MAX_LENGTH}
            </p>
          </div>
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
              accept={FORUM_ALLOWED_IMAGE_TYPES}
              multiple
              label="Odaberi slike"
              helperText={`Podržani formati su ${FORUM_ALLOWED_IMAGE_TYPES}. Maksimalno 5 slika, do 1 MB po slici.`}
              onChange={(event) => {
                const selectedImages = Array.from(event.target.files ?? []);
                const currentExistingImageCount = getForumImageItems(answer).length;
                setDraftImages(selectedImages);
                setRemoveExistingImage(false);
                setEditError(
                  validateForumImages(selectedImages, currentExistingImageCount) || null
                );
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
                  onClick={() => {
                    onDeleteImage(answer.id);
                    setRemoveExistingImage(true);
                  }}
                  disabled={isUpdating || isDeletingImage}
                >
                  {isDeletingImage ? 'Miči...' : 'Makni postojeću'}
                </Button>
              )}
            </div>
          )}
          {removeExistingImage && (
            <p className="mt-4 rounded-2xl bg-red/10 px-4 py-3 text-sm font-medium text-red">
              Postojeća slika se uklanja.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
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
            <ContentFormatter text={answer.body} taggedUsers={answer.taggedUsers} />
          </div>
          <ForumImageGallery
            item={answer}
            alt="Slika odgovora"
            className="mt-4"
            imageClassName="max-w-full rounded-2xl border border-[#dce4ff]"
          />
          <div className="mt-5 pt-4">
            {replyCount > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:border-blue hover:text-blue"
                  onClick={() => setIsRepliesCollapsed((isCollapsed) => !isCollapsed)}
                  aria-expanded={!isRepliesCollapsed}
                  aria-controls={`answer-${answer.id}-replies`}
                >
                  {isRepliesCollapsed ? <BiChevronDown size={18} /> : <BiChevronUp size={18} />}
                  {isRepliesCollapsed
                    ? `Prikaži odgovore (${replyCount})`
                    : `Sakrij odgovore (${replyCount})`}
                </button>
              </div>
            )}
            {replyCount > 0 && !isRepliesCollapsed && (
              <div id={`answer-${answer.id}-replies`} className="mt-3 space-y-3">
                {(answer.replies ?? []).map((reply) => {
                  const replyAuthorId = getReplyAuthorId(reply);
                  const replyAuthorPublicId = getReplyAuthorPublicId(reply);
                  const isOwnReply = currentUserId === replyAuthorId;
                  const isEditingReply = editingReplyId === reply.id;

                  return (
                    <div
                      key={reply.id}
                      className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] px-4 py-3"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <Link
                          to={getUserProfilePath({
                            id: replyAuthorId,
                            publicId: replyAuthorPublicId,
                          })}
                          className="text-sm font-bold text-blue underline"
                        >
                          {getReplyAuthorName(reply)}
                        </Link>
                        <RecordCreatedAt createdAt={reply.createdAt} className="!text-xs" />
                      </div>
                      {isEditingReply ? (
                        <div>
                          <textarea
                            value={editingReplyBody}
                            onChange={(event) => {
                              setEditingReplyBody(event.target.value);
                              setReplyError(null);
                            }}
                            rows={3}
                            maxLength={ANSWER_MAX_LENGTH}
                            className="w-full rounded-2xl border border-[#dce4ff] bg-white px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-blue"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <Button
                              type="secondary"
                              htmlType="button"
                              className="rounded-full border border-[#dce4ff] px-4 py-2"
                              onClick={() => {
                                setEditingReplyId(null);
                                setEditingReplyBody('');
                                setReplyError(null);
                              }}
                              disabled={isReplyPending}
                            >
                              Odustani
                            </Button>
                            <Button
                              type="blue"
                              htmlType="button"
                              className="rounded-full px-4 py-2"
                              onClick={() => handleSubmitReplyEdit(reply.id)}
                              disabled={isReplyPending}
                            >
                              Spremi
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm leading-6 text-gray-800">
                          <ContentFormatter text={reply.body} />
                        </div>
                      )}
                      {!isEditingReply && (
                        <div className="mt-2 flex justify-end gap-2">
                          <div className="relative">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-full border border-[#dce4ff] bg-white px-3 py-1 text-xs font-bold text-gray-700 transition-colors hover:border-blue hover:text-blue"
                              onClick={() =>
                                setReplyReactionDropdownId((currentReplyId) =>
                                  currentReplyId === reply.id ? null : reply.id
                                )
                              }
                              aria-expanded={replyReactionDropdownId === reply.id}
                              aria-haspopup="menu"
                            >
                              Reakcije
                              <BiChevronDown size={16} />
                            </button>
                            {replyReactionDropdownId === reply.id && (
                              <div
                                role="menu"
                                className="absolute bottom-8 right-0 z-20 w-48 rounded-2xl border border-[#dce4ff] bg-white p-3 shadow-xl shadow-blue-dark/10"
                              >
                                <div className="flex flex-wrap gap-1.5">
                                  {ANSWER_REACTION_EMOJIS.map((emoji) => {
                                    const reaction = reply.reactions?.find(
                                      (item) => item.emoji === emoji
                                    );
                                    const userReactions = [
                                      ...(reply.currentUserReactions ?? []),
                                      ...(reply.myReactions ?? []),
                                      ...(reply.userReactions ?? []),
                                    ];
                                    const hasReacted = hasCurrentUserReacted(
                                      reaction,
                                      currentUserId,
                                      userReactions
                                    );
                                    const count = reaction?.count ?? 0;

                                    return (
                                      <button
                                        key={emoji}
                                        type="button"
                                        disabled={isReplyReactionPending || !currentUserId}
                                        onClick={() => {
                                          if (hasReacted) {
                                            onDeleteReplyReaction(reply.id, emoji);
                                          } else {
                                            onAddReplyReaction(reply.id, emoji);
                                          }
                                        }}
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                          hasReacted
                                            ? 'border-blue bg-blue text-white'
                                            : 'border-[#dce4ff] bg-white text-gray-700 hover:border-blue hover:text-blue'
                                        }`}
                                        aria-label={`${hasReacted ? 'Makni' : 'Dodaj'} reakciju ${emoji}`}
                                      >
                                        <span>{emoji}</span>
                                        {count > 0 && <span className="tabular-nums">{count}</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          {isOwnReply && (
                            <>
                              <Button
                                type="transparent"
                                htmlType="button"
                                className="!px-3 !py-1 text-xs"
                                onClick={() => {
                                  setEditingReplyId(reply.id);
                                  setEditingReplyBody(reply.body);
                                  setReplyError(null);
                                }}
                                disabled={isReplyPending}
                              >
                                Uredi
                              </Button>
                              <Button
                                type="danger"
                                htmlType="button"
                                className="!px-3 !py-1 text-xs"
                                onClick={() => setReplyIdPendingDelete(reply.id)}
                                disabled={isReplyPending}
                              >
                                Obriši
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {isReplyFormOpen && (
              <div className="mt-3">
                <textarea
                  value={replyBody}
                  onChange={(event) => {
                    setReplyBody(event.target.value);
                    setReplyError(null);
                  }}
                  rows={3}
                  maxLength={ANSWER_MAX_LENGTH}
                  className="w-full rounded-2xl border border-[#dce4ff] px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-blue"
                  placeholder="Napiši odgovor na ovaj odgovor..."
                />
                {replyError && <p className="mt-2 text-sm font-medium text-red">{replyError}</p>}
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="secondary"
                    htmlType="button"
                    className="rounded-full border border-[#dce4ff] px-4 py-2"
                    disabled={isReplyPending}
                    onClick={() => {
                      setIsReplyFormOpen(false);
                      setReplyBody('');
                      setReplyError(null);
                    }}
                  >
                    Odustani
                  </Button>
                  <Button
                    type="blue"
                    htmlType="button"
                    className="rounded-full px-4 py-2"
                    onClick={handleSubmitReply}
                    disabled={isReplyPending || !replyBody.trim()}
                  >
                    Odgovori
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
};

export default AnswerCard;
