import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BiDotsVerticalRounded, BiEdit, BiFlag, BiTrash } from 'react-icons/bi';
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
import VoteControls, { getVoteScore } from '../components/VoteControls';
import {
  useAcceptAnswer,
  useCreateAnswer,
  useDeleteAnswer,
  useDeleteAnswerVote,
  useDeleteQuestion,
  useDeleteQuestionVote,
  useForumSocketEvents,
  useQuestion,
  useUpdateAnswer,
  useUpdateQuestion,
  useVoteAnswer,
  useVoteQuestion,
} from '../hooks/useForum';
import { getForumErrorMessage } from '../utils/forumErrors';
import ForumImage from '../components/ForumImage';

interface CurrentUserData {
  id?: number;
  name?: string;
  username?: string;
  picture?: string;
}

const ANSWERS_PER_PAGE = 5;

const ForumQuestionDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const questionId = Number(id);
  const isValidQuestionId = Number.isFinite(questionId) && questionId > 0;
  useForumSocketEvents(isValidQuestionId ? questionId : undefined);
  const [answerPage, setAnswerPage] = useState(1);
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
  const voteQuestionMutation = useVoteQuestion(isValidQuestionId ? questionId : 0);
  const deleteQuestionVoteMutation = useDeleteQuestionVote(isValidQuestionId ? questionId : 0);
  const voteAnswerMutation = useVoteAnswer(isValidQuestionId ? questionId : 0);
  const deleteAnswerVoteMutation = useDeleteAnswerVote(isValidQuestionId ? questionId : 0);
  const updateAnswerMutation = useUpdateAnswer();
  const deleteAnswerMutation = useDeleteAnswer(isValidQuestionId ? questionId : undefined);
  const question = questionQuery.data;
  const answers = [...(question?.Answers ?? [])].sort(
    (firstAnswer, secondAnswer) =>
      new Date(secondAnswer.createdAt).getTime() - new Date(firstAnswer.createdAt).getTime()
  );
  const hasAcceptedAnswer = answers.some((answer) => answer.isAccepted);
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
  const isQuestionVotePending =
    voteQuestionMutation.isPending || deleteQuestionVoteMutation.isPending;
  const isAnswerVotePending = voteAnswerMutation.isPending || deleteAnswerVoteMutation.isPending;
  const questionVoteScore = question ? getVoteScore(question) : 0;

  if (!isValidQuestionId) {
    return (
      <AppLayout>
        <div className="rounded-3xl border border-red/30 bg-rose px-6 py-5 text-sm font-medium text-gray-800">
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
        <div className="rounded-3xl border border-red/30 bg-rose px-6 py-5 text-sm font-medium text-gray-800">
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
            Ova radnja će trajno ukloniti pitanje i sve povezane podatke: slike, odgovore i
            glasove.
          </p>
        </ConfirmModal>

        {isEditingQuestion ? (
          <section>
            {updateQuestionMutation.isError && (
              <div className="mb-4 rounded-3xl border border-red/30 bg-rose px-6 py-5 text-sm font-medium text-gray-800">
                {getForumErrorMessage(
                  updateQuestionMutation.error,
                  'Nije moguće urediti pitanje. Provjeri podatke i pokušaj ponovno.'
                )}
              </div>
            )}
            <QuestionForm
              initialQuestion={question}
              isSubmitting={updateQuestionMutation.isPending}
              onCancel={() => setIsEditingQuestion(false)}
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
              <div className="relative">
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
                    {!isQuestionOwner && (
                      <div className="mb-2 rounded-xl bg-[#f7f9ff] p-2">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                          Glasanje
                        </p>
                        <VoteControls
                          item={question}
                          isPending={isQuestionVotePending}
                          onVote={(value) => voteQuestionMutation.mutate({ value })}
                          onClearVote={() => deleteQuestionVoteMutation.mutate()}
                          className="w-full justify-center"
                        />
                      </div>
                    )}

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
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red transition-colors hover:bg-rose disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red transition-colors hover:bg-rose"
                      onClick={() => setIsQuestionActionsOpen(false)}
                    >
                      <BiFlag size={20} />
                      Prijavi
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <Link
                to={`/user/${authorId}`}
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
              <span className="rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-3 py-1 text-sm font-semibold text-blue-dark">
                {questionVoteScore} glasova
              </span>
            </div>

            {deleteQuestionMutation.isError && (
              <div className="mt-4 rounded-3xl border border-red/30 bg-rose px-6 py-5 text-sm font-medium text-gray-800">
                {getForumErrorMessage(
                  deleteQuestionMutation.error,
                  'Nije moguće obrisati pitanje. Pokušaj ponovno.'
                )}
              </div>
            )}

            <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-gray-800">
              <ContentFormatter text={question.body} />
            </div>
            {(question.securePhotoUrl || question.imageUrl) && (
              <ForumImage
                securePhotoUrl={question.securePhotoUrl}
                imageUrl={question.imageUrl}
                alt="Slika pitanja"
                className="mt-5 max-w-full rounded-2xl border border-[#dce4ff]"
              />
            )}
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
                    isDeleting={deleteAnswerMutation.isPending}
                    isUpdating={updateAnswerMutation.isPending}
                    isVotePending={isAnswerVotePending}
                    onAccept={(answerId) => acceptAnswerMutation.mutate(answerId)}
                    onDelete={(answerId) => deleteAnswerMutation.mutate(answerId)}
                    onUpdate={(answerId, payload) =>
                      updateAnswerMutation.mutate({ id: answerId, payload })
                    }
                    onVote={(answerId, value) =>
                      voteAnswerMutation.mutate({ answerId, payload: { value } })
                    }
                    onClearVote={(answerId) => deleteAnswerVoteMutation.mutate(answerId)}
                  />
                ))}
              </div>

              {totalAnswerPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button
                    type="secondary"
                    className="rounded-full border border-[#dce4ff] px-5 py-2"
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
                    className="rounded-full border border-[#dce4ff] px-5 py-2"
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
              <div className="mb-4 rounded-3xl border border-red/30 bg-rose px-6 py-5 text-sm font-medium text-gray-800">
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
