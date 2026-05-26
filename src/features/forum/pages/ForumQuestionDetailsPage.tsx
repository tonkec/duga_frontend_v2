import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BiDotsVerticalRounded, BiEdit, BiFlag, BiTrash } from 'react-icons/bi';
import Select from 'react-select';
import AppLayout from '@app/components/AppLayout';
import Button from '@app/components/Button';
import ConfirmModal from '@app/components/ConfirmModal';
import ContentFormatter from '@app/components/ContentFormatter';
import Loader from '@app/components/Loader';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import AnswerCard from '../components/AnswerCard';
import AnswerForm from '../components/AnswerForm';
import QuestionForm from '../components/QuestionForm';
import VoteControls from '../components/VoteControls';
import { getVoteScore } from '../components/VoteControls';
import {
  useAcceptAnswer,
  useAddAnswerReaction,
  useAddAnswerReplyReaction,
  useCreateAnswer,
  useCreateAnswerReply,
  useDeleteAnswer,
  useDeleteAnswerImage,
  useDeleteAnswerReply,
  useDeleteAnswerReplyReaction,
  useDeleteAnswerReaction,
  useDeleteQuestion,
  useDeleteQuestionImage,
  useDeleteQuestionVote,
  useForumSocketEvents,
  useQuestion,
  useUpdateAnswer,
  useUpdateAnswerReply,
  useUpdateQuestion,
  useVoteQuestion,
} from '../hooks/useForum';
import { getForumErrorMessage } from '../utils/forumErrors';
import ForumImageGallery from '../components/ForumImageGallery';
import type { Answer } from '../types/forum.types';
import { getVoteLabel } from '../utils/forumLabels';
import { getUserProfilePath } from '@app/utils/userProfilePath';

interface CurrentUserData {
  id?: number;
  name?: string;
  username?: string;
  picture?: string;
}

const ANSWERS_PER_PAGE = 5;
type AnswerSortOption = 'newest' | 'oldest' | 'accepted';

const baseAnswerSortOptions: { label: string; value: AnswerSortOption }[] = [
  { label: 'Najnoviji', value: 'newest' },
  { label: 'Najstariji', value: 'oldest' },
];

const acceptedAnswerSortOption: { label: string; value: AnswerSortOption } = {
  label: 'Prihvaćeni prvo',
  value: 'accepted',
};

const getAnswerSortOptions = (hasAcceptedAnswer: boolean) => [
  ...baseAnswerSortOptions,
  ...(hasAcceptedAnswer ? [acceptedAnswerSortOption] : []),
];

const answerSortSelectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '2.75rem',
    borderRadius: '1rem',
    borderColor: state.isFocused ? '#2D46B9' : '#dce4ff',
    boxShadow: state.isFocused ? '0 0 0 1px #2D46B9' : '0 1px 2px rgba(15, 23, 42, 0.05)',
    '&:hover': {
      borderColor: '#2D46B9',
    },
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid #dce4ff',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2D46B9' : state.isFocused ? '#f0f4ff' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    ':active': {
      backgroundColor: '#2D46B9',
      color: 'white',
    },
  }),
};

const sortAnswers = (answers: Answer[], sortOption: AnswerSortOption) => {
  return [...answers].sort((firstAnswer, secondAnswer) => {
    const firstCreatedAt = new Date(firstAnswer.createdAt).getTime();
    const secondCreatedAt = new Date(secondAnswer.createdAt).getTime();

    if (sortOption === 'accepted') {
      const acceptedDifference = Number(secondAnswer.isAccepted) - Number(firstAnswer.isAccepted);
      return acceptedDifference || secondCreatedAt - firstCreatedAt;
    }

    if (sortOption === 'oldest') {
      return firstCreatedAt - secondCreatedAt;
    }

    return secondCreatedAt - firstCreatedAt;
  });
};

const ForumQuestionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const questionId = Number(id);
  const isValidQuestionId = Number.isFinite(questionId) && questionId > 0;
  useForumSocketEvents(isValidQuestionId ? questionId : undefined);
  const [answerPage, setAnswerPage] = useState(1);
  const [answerSort, setAnswerSort] = useState<AnswerSortOption>('newest');
  const questionActionsDropdownRef = useRef<HTMLDivElement>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isQuestionActionsOpen, setIsQuestionActionsOpen] = useState(false);
  const [isDeleteQuestionModalOpen, setIsDeleteQuestionModalOpen] = useState(false);

  const questionQuery = useQuestion(id);
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const currentUserData = currentUser?.data as CurrentUserData | undefined;
  const forumCurrentUser = currentUserData?.id
    ? {
        id: currentUserData.id,
        name: currentUserData.name,
        username: currentUserData.username,
        picture: currentUserData.picture,
      }
    : undefined;
  const createAnswerMutation = useCreateAnswer(
    isValidQuestionId ? questionId : 0,
    forumCurrentUser
  );
  const acceptAnswerMutation = useAcceptAnswer(isValidQuestionId ? questionId : 0);
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const deleteQuestionImageMutation = useDeleteQuestionImage();
  const voteQuestionMutation = useVoteQuestion(isValidQuestionId ? questionId : 0);
  const deleteQuestionVoteMutation = useDeleteQuestionVote(isValidQuestionId ? questionId : 0);
  const updateAnswerMutation = useUpdateAnswer();
  const deleteAnswerMutation = useDeleteAnswer(isValidQuestionId ? questionId : undefined);
  const deleteAnswerImageMutation = useDeleteAnswerImage(isValidQuestionId ? questionId : 0);
  const addAnswerReactionMutation = useAddAnswerReaction(isValidQuestionId ? questionId : 0);
  const deleteAnswerReactionMutation = useDeleteAnswerReaction(isValidQuestionId ? questionId : 0);
  const addAnswerReplyReactionMutation = useAddAnswerReplyReaction(
    isValidQuestionId ? questionId : 0
  );
  const deleteAnswerReplyReactionMutation = useDeleteAnswerReplyReaction(
    isValidQuestionId ? questionId : 0
  );
  const createAnswerReplyMutation = useCreateAnswerReply(
    isValidQuestionId ? questionId : 0,
    forumCurrentUser
  );
  const updateAnswerReplyMutation = useUpdateAnswerReply(isValidQuestionId ? questionId : 0);
  const deleteAnswerReplyMutation = useDeleteAnswerReply(isValidQuestionId ? questionId : 0);
  const question = questionQuery.data;
  const answers = sortAnswers(question?.Answers ?? [], answerSort);
  const hasAcceptedAnswer = answers.some((answer) => answer.isAccepted);
  const answerSortOptions = getAnswerSortOptions(hasAcceptedAnswer);
  const totalAnswerPages = Math.max(1, Math.ceil(answers.length / ANSWERS_PER_PAGE));
  const visibleAnswerPage = Math.min(answerPage, totalAnswerPages);
  const paginatedAnswers = answers.slice(
    (visibleAnswerPage - 1) * ANSWERS_PER_PAGE,
    visibleAnswerPage * ANSWERS_PER_PAGE
  );
  const isQuestionOwner =
    !!currentUserData?.id &&
    (question?.userId ?? question?.User?.id ?? question?.user?.id) === currentUserData.id;
  const authorName = question?.User?.name || question?.User?.username || 'Korisnik';
  const authorId = question?.User?.id ?? question?.userId;
  const authorPublicId = question?.User?.publicId ?? question?.user?.publicId;
  const isQuestionVotePending =
    voteQuestionMutation.isPending || deleteQuestionVoteMutation.isPending;
  const isAnswerReactionPending =
    addAnswerReactionMutation.isPending || deleteAnswerReactionMutation.isPending;
  const isAnswerReplyPending =
    createAnswerReplyMutation.isPending ||
    updateAnswerReplyMutation.isPending ||
    deleteAnswerReplyMutation.isPending;
  const isAnswerReplyReactionPending =
    addAnswerReplyReactionMutation.isPending || deleteAnswerReplyReactionMutation.isPending;
  const questionVoteScore = question ? getVoteScore(question) : 0;

  useEffect(() => {
    if (!isQuestionActionsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        questionActionsDropdownRef.current &&
        !questionActionsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsQuestionActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuestionActionsOpen]);

  useEffect(() => {
    if (!hasAcceptedAnswer && answerSort === 'accepted') {
      setAnswerSort('newest');
      setAnswerPage(1);
    }
  }, [answerSort, hasAcceptedAnswer]);

  if (!isValidQuestionId) {
    return (
      <AppLayout>
        <div className="rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
          Neispravan ID pitanja.
        </div>
      </AppLayout>
    );
  }

  if (questionQuery.isPending) {
    return (
      <AppLayout>
        <Loader label="Učitavanje pitanja..." />
      </AppLayout>
    );
  }

  if (questionQuery.isError || !question) {
    return (
      <AppLayout>
        <div className="rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
          Nije moguće učitati pitanje. Pokušaj ponovno malo kasnije.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <article className="mx-auto max-w-4xl">
        <Link to="/forum" className="mb-5 inline-flex text-sm font-semibold text-blue underline">
          Povratak na forum
        </Link>

        <ConfirmModal
          isOpen={isDeleteQuestionModalOpen}
          onClose={() => setIsDeleteQuestionModalOpen(false)}
          onConfirm={() => {
            setIsDeleteQuestionModalOpen(false);
            deleteQuestionMutation.mutate(question.id, {
              onSuccess: () => navigate('/forum'),
            });
          }}
        >
          <h2 className="text-xl font-bold text-gray-950">Obrisati pitanje?</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Ova radnja će trajno ukloniti pitanje i sve povezane podatke: slike, odgovore i glasove.
          </p>
        </ConfirmModal>

        {isEditingQuestion ? (
          <section>
            {updateQuestionMutation.isError && (
              <div className="mb-4 rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
                {getForumErrorMessage(
                  updateQuestionMutation.error,
                  'Nije moguće urediti pitanje. Provjeri podatke i pokušaj ponovno.'
                )}
              </div>
            )}
            {deleteQuestionImageMutation.isError && (
              <div className="mb-4 rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
                {getForumErrorMessage(
                  deleteQuestionImageMutation.error,
                  'Nije moguće obrisati sliku pitanja. Pokušaj ponovno.'
                )}
              </div>
            )}
            <QuestionForm
              initialQuestion={question}
              isDeletingExistingImage={deleteQuestionImageMutation.isPending}
              isSubmitting={updateQuestionMutation.isPending}
              onCancel={() => setIsEditingQuestion(false)}
              onDeleteExistingImage={() => deleteQuestionImageMutation.mutate(question.id)}
              onSubmit={(payload) =>
                updateQuestionMutation.mutate(
                  { id: question.id, payload },
                  { onSuccess: () => setIsEditingQuestion(false) }
                )
              }
              submitLabel="Spremi pitanje"
              submittingLabel="Spremam..."
            />
          </section>
        ) : (
          <section className="rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm md:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {question.Category && (
                <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue-dark">
                  {question.Category.name}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  hasAcceptedAnswer ? 'bg-green/10 text-green' : 'bg-[#f7f9ff] text-gray-500'
                }`}
              >
                {hasAcceptedAnswer ? 'Riješeno' : 'Otvoreno'}
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-950">{question.title}</h1>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="relative" ref={questionActionsDropdownRef}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-blue hover:text-blue"
                    onClick={() => setIsQuestionActionsOpen((isOpen) => !isOpen)}
                    aria-expanded={isQuestionActionsOpen}
                    aria-haspopup="menu"
                  >
                    Akcije
                    <BiDotsVerticalRounded size={18} />
                  </button>

                  {isQuestionActionsOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-12 z-20 w-60 rounded-2xl border border-[#dce4ff] bg-white p-2 text-sm shadow-xl shadow-blue-dark/10"
                    >
                      {isQuestionOwner && (
                        <>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-gray-700 transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={deleteQuestionMutation.isPending}
                            onClick={() => {
                              setIsQuestionActionsOpen(false);
                              setIsEditingQuestion(true);
                            }}
                          >
                            <BiEdit size={20} />
                            Uredi pitanje
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red transition-colors hover:bg-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={deleteQuestionMutation.isPending}
                            onClick={() => {
                              setIsQuestionActionsOpen(false);
                              setIsDeleteQuestionModalOpen(true);
                            }}
                          >
                            <BiTrash size={20} />
                            {deleteQuestionMutation.isPending ? 'Brišem...' : 'Obriši pitanje'}
                          </button>
                        </>
                      )}

                      <Link
                        to="/report"
                        role="menuitem"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red transition-colors hover:bg-red/10"
                        onClick={() => setIsQuestionActionsOpen(false)}
                      >
                        <BiFlag size={20} />
                        Prijavi
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <Link
                to={getUserProfilePath({ id: authorId, publicId: authorPublicId })}
                className="inline-flex items-center gap-2 font-semibold text-blue underline"
              >
                <UserAvatar
                  avatarFallbackName={authorName}
                  color="#2D46B9"
                  userId={String(authorId)}
                  size="32"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-blue">{authorName}</span>
              </Link>
              <RecordCreatedAt createdAt={question.createdAt} className="!text-sm !text-gray-500" />
            </div>

            {deleteQuestionMutation.isError && (
              <div className="mt-4 rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
                {getForumErrorMessage(
                  deleteQuestionMutation.error,
                  'Nije moguće obrisati pitanje. Pokušaj ponovno.'
                )}
              </div>
            )}

            <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-gray-800">
              <ContentFormatter text={question.body} taggedUsers={question.taggedUsers} />
            </div>
            <ForumImageGallery
              item={question}
              alt="Slika pitanja"
              className="mt-5"
              imageClassName="max-w-full rounded-2xl border border-[#dce4ff]"
            />
            <div className="mt-5 flex justify-end">
              {!isQuestionOwner ? (
                <VoteControls
                  item={question}
                  isPending={isQuestionVotePending}
                  onVote={(value) => voteQuestionMutation.mutate({ value })}
                  onClearVote={() => deleteQuestionVoteMutation.mutate()}
                />
              ) : (
                <span className="rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-3 py-1 text-sm font-semibold text-blue-dark">
                  {questionVoteScore} {getVoteLabel(questionVoteScore)}
                </span>
              )}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">
                Odgovori
              </p>
              <h2 className="text-2xl font-bold text-gray-950">
                {answers.length} {answers.length === 1 ? 'odgovor' : 'odgovora'}
              </h2>
            </div>
            {answers.length > 1 && (
              <label className="flex flex-col gap-1 text-sm font-semibold text-gray-600 sm:min-w-48">
                Sortiraj
                <Select
                  options={answerSortOptions}
                  value={answerSortOptions.find((option) => option.value === answerSort) ?? null}
                  onChange={(option) => {
                    setAnswerSort((option?.value ?? 'newest') as AnswerSortOption);
                    setAnswerPage(1);
                  }}
                  styles={answerSortSelectStyles}
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: '#f0f4ff',
                      primary50: '#dce4ff',
                      primary: '#2D46B9',
                    },
                  })}
                  classNamePrefix="react-select"
                />
              </label>
            )}
          </div>

          {answers.length === 0 && (
            <div className="rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] px-6 py-8 text-center text-sm text-gray-600">
              Još nema odgovora na ovo pitanje.
            </div>
          )}

          {answers.length > 0 && (
            <>
              <div className="grid gap-4">
                {paginatedAnswers.map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    canAccept={isQuestionOwner}
                    hasAcceptedAnswer={hasAcceptedAnswer}
                    currentUserId={currentUserData?.id}
                    isAccepting={acceptAnswerMutation.isPending}
                    isDeletingImage={deleteAnswerImageMutation.isPending}
                    isDeleting={deleteAnswerMutation.isPending}
                    isUpdating={updateAnswerMutation.isPending}
                    isReactionPending={isAnswerReactionPending}
                    isReplyPending={isAnswerReplyPending}
                    isReplyReactionPending={isAnswerReplyReactionPending}
                    onAccept={(answerId) => acceptAnswerMutation.mutate(answerId)}
                    onDelete={(answerId) => deleteAnswerMutation.mutate(answerId)}
                    onDeleteImage={(answerId) => deleteAnswerImageMutation.mutate(answerId)}
                    onUpdate={(answerId, payload) =>
                      updateAnswerMutation.mutate({ id: answerId, payload })
                    }
                    onAddReaction={(answerId, emoji) =>
                      addAnswerReactionMutation.mutate({ answerId, payload: { emoji } })
                    }
                    onDeleteReaction={(answerId, emoji) =>
                      deleteAnswerReactionMutation.mutate({ answerId, payload: { emoji } })
                    }
                    onCreateReply={(answerId, payload) =>
                      createAnswerReplyMutation.mutate({ answerId, payload })
                    }
                    onUpdateReply={(replyId, payload) =>
                      updateAnswerReplyMutation.mutate({ id: replyId, payload })
                    }
                    onDeleteReply={(replyId) => deleteAnswerReplyMutation.mutate(replyId)}
                    onAddReplyReaction={(replyId, emoji) =>
                      addAnswerReplyReactionMutation.mutate({ replyId, payload: { emoji } })
                    }
                    onDeleteReplyReaction={(replyId, emoji) =>
                      deleteAnswerReplyReactionMutation.mutate({ replyId, payload: { emoji } })
                    }
                  />
                ))}
              </div>

              {totalAnswerPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button
                    type="secondary"
                    className="pagination-text-button rounded-full border border-[#dce4ff] px-5 py-2"
                    disabled={visibleAnswerPage === 1}
                    onClick={() => setAnswerPage((currentPage) => Math.max(1, currentPage - 1))}
                  >
                    Prethodna
                  </Button>
                  <span className="text-sm font-semibold text-gray-600">
                    Stranica {visibleAnswerPage} / {totalAnswerPages}
                  </span>
                  <Button
                    type="secondary"
                    className="pagination-text-button rounded-full border border-[#dce4ff] px-5 py-2"
                    disabled={visibleAnswerPage >= totalAnswerPages}
                    onClick={() =>
                      setAnswerPage((currentPage) => Math.min(totalAnswerPages, currentPage + 1))
                    }
                  >
                    Sljedeća
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {!isUserLoading && currentUserData?.id && (
          <section className="mt-8">
            {createAnswerMutation.isError && (
              <div className="mb-4 rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
                {getForumErrorMessage(
                  createAnswerMutation.error,
                  'Nije moguće poslati odgovor. Provjeri podatke i pokušaj ponovno.'
                )}
              </div>
            )}
            <AnswerForm
              isSubmitting={createAnswerMutation.isPending}
              onSubmit={(payload) => {
                setAnswerPage(Math.max(1, Math.ceil((answers.length + 1) / ANSWERS_PER_PAGE)));
                createAnswerMutation.mutate(payload);
              }}
            />
          </section>
        )}
      </article>
    </AppLayout>
  );
};

export default ForumQuestionDetailsPage;
