import { Link, useNavigate } from 'react-router-dom';
import ContentFormatter from '@app/components/ContentFormatter';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';
import type { Question } from '../types/forum.types';
import VoteControls, { getVoteScore } from './VoteControls';
import { useDeleteQuestionVote, useVoteQuestion } from '../hooks/useForum';

interface QuestionCardProps {
  question: Question;
  currentUserId?: number;
}

const HOT_QUESTION_ANSWER_COUNT = 5;

const getAuthorName = (question: Question) =>
  question.User?.name || question.User?.username || 'Korisnik';

const getAuthorId = (question: Question) => question.User?.id ?? question.userId;

const getBodyPreview = (body: string) => {
  const normalizedBody = body.replace(/\s+/g, ' ').trim();

  if (normalizedBody.length <= 180) {
    return normalizedBody;
  }

  return `${normalizedBody.slice(0, 180)}...`;
};

const getQuestionAnswerCount = (question: Question) =>
  Math.max(question.answerCount ?? 0, question.Answers?.length ?? 0);

const hasAcceptedAnswer = (question: Question) =>
  Boolean(question.Answers?.some((answer) => answer.isAccepted));

const QuestionCard = ({ question, currentUserId }: QuestionCardProps) => {
  const navigate = useNavigate();
  const voteQuestionMutation = useVoteQuestion(question.id);
  const deleteQuestionVoteMutation = useDeleteQuestionVote(question.id);
  const isVotePending = voteQuestionMutation.isPending || deleteQuestionVoteMutation.isPending;
  const isOwnQuestion = currentUserId === (question.userId ?? question.User?.id ?? question.user?.id);
  const answerCount = getQuestionAnswerCount(question);
  const voteScore = getVoteScore(question);
  const isHotQuestion = answerCount >= HOT_QUESTION_ANSWER_COUNT;
  const authorId = getAuthorId(question);
  const authorName = getAuthorName(question);
  const isResolved = hasAcceptedAnswer(question);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/forum/questions/${question.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          navigate(`/forum/questions/${question.id}`);
        }
      }}
      className="group block cursor-pointer rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {question.Category && (
              <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue-dark">
                {question.Category.name}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isResolved ? 'bg-green/10 text-green' : 'bg-[#f7f9ff] text-gray-500'
              }`}
            >
              {isResolved ? 'Riješeno' : 'Otvoreno'}
            </span>
            {isHotQuestion && (
              <span className="rounded-full bg-pink/10 px-3 py-1 text-xs font-semibold text-pink">
                Popularno
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-950 transition-colors group-hover:text-blue">
            {question.title}
          </h2>
          <div className="mt-3 text-sm leading-6 text-gray-600">
            <ContentFormatter text={getBodyPreview(question.body)} renderRichContent={false} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-2 text-sm font-semibold text-blue-dark">
            {voteScore} glasova
          </span>
          <span className="rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-2 text-sm font-semibold text-blue-dark">
            {answerCount} odgovora
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
        <Link
          to={`/user/${authorId}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex items-center gap-2 align-middle font-semibold text-blue underline"
        >
          <UserAvatar
            avatarFallbackName={authorName}
            color="#2D46B9"
            userId={String(authorId)}
            size="28"
            className="h-7 w-7 rounded-full"
          />
          {authorName}
        </Link>
        <RecordCreatedAt createdAt={question.createdAt} className="!text-xs !text-gray-500" />
        <Link
          to="/report"
          onClick={(event) => event.stopPropagation()}
          className="rounded-full border border-red/20 bg-rose px-3 py-1 text-xs font-semibold text-red transition-colors hover:border-red/40"
        >
          Prijavi
        </Link>
        {!isOwnQuestion && (
          <VoteControls
            item={question}
            isPending={isVotePending}
            onVote={(value) => voteQuestionMutation.mutate({ value })}
            onClearVote={() => deleteQuestionVoteMutation.mutate()}
          />
        )}
      </div>
    </article>
  );
};

export default QuestionCard;
