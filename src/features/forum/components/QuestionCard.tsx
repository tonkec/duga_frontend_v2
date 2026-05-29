import { Link, useNavigate } from 'react-router-dom';
import ContentFormatter from '@app/components/ContentFormatter';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';
import { BiFlag } from 'react-icons/bi';
import type { Question } from '../types/forum.types';
import { getVoteScore } from './VoteControls';
import { getVoteLabel } from '../utils/forumLabels';
import { getUserProfilePath } from '@app/utils/userProfilePath';
import { getForumUserAvatarProfilePhoto } from '../utils/forumUserAvatar';

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
  const answerCount = getQuestionAnswerCount(question);
  const voteScore = getVoteScore(question);
  const isHotQuestion = answerCount >= HOT_QUESTION_ANSWER_COUNT;
  const authorId = getAuthorId(question);
  const authorName = getAuthorName(question);
  const authorProfilePhoto = getForumUserAvatarProfilePhoto(question.User || question.user);
  const isResolved = hasAcceptedAnswer(question);
  const isOwnQuestion = Number(currentUserId) === Number(authorId);

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
      className="group block cursor-pointer rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm transition-all hover:border-blue/40 hover:shadow-md"
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_9rem] md:items-start">
        <div className="min-w-0 space-y-4">
          {(isResolved || isHotQuestion) && (
            <div className="flex flex-wrap gap-2">
              {isResolved && (
                <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-bold text-green">
                  Riješeno
                </span>
              )}
              {isHotQuestion && (
                <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-bold text-blue">
                  Popularno
                </span>
              )}
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-950 transition-colors group-hover:text-blue">
            {question.title}
          </h2>
          <div className="text-sm leading-6 text-gray-600">
            <ContentFormatter text={getBodyPreview(question.body)} renderRichContent={false} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          <div className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] px-4 py-3 text-center">
            <span className="block text-lg font-black text-blue-dark">{voteScore}</span>
            <span className="text-xs font-semibold text-gray-500">{getVoteLabel(voteScore)}</span>
          </div>
          <div className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] px-4 py-3 text-center">
            <span className="block text-lg font-black text-blue-dark">{answerCount}</span>
            <span className="text-xs font-semibold text-gray-500">odgovora</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 text-xs font-medium text-gray-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            to={getUserProfilePath({ id: authorId, publicId: question.User?.publicId })}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-2 align-middle font-semibold text-blue underline"
          >
            <UserAvatar
              avatarFallbackName={authorName}
              color="#2D46B9"
              userId={String(authorId)}
              size="28"
              className="h-7 w-7 rounded-full"
              profilePhoto={authorProfilePhoto}
            />
            {authorName}
          </Link>
          <RecordCreatedAt createdAt={question.createdAt} className="!text-xs !text-gray-500" />
        </div>
        {!isOwnQuestion && (
          <Link
            to="/report"
            onClick={(event) => event.stopPropagation()}
            className="ml-auto inline-flex items-center gap-1.5 font-semibold text-red transition-colors hover:text-red"
          >
            <BiFlag size={16} />
            Prijavi
          </Link>
        )}
      </div>
    </article>
  );
};

export default QuestionCard;
