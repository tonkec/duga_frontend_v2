import { Link } from 'react-router-dom';
import ContentFormatter from '@app/components/ContentFormatter';
import Loader from '@app/components/Loader';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useQuestions } from '../hooks/useForum';
import type { Answer, Question } from '../types/forum.types';

interface UserForumActivityProps {
  isError?: boolean;
  isLoading?: boolean;
  questions?: Question[];
  userId: number | string | undefined;
  type: 'questions' | 'answers';
}

const getAnswerCount = (question: Question) =>
  Math.max(question.answerCount ?? 0, question.Answers?.length ?? 0);

const getPreview = (text: string, length = 160) => {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  return normalizedText.length > length ? `${normalizedText.slice(0, length)}...` : normalizedText;
};

export const getUserForumQuestions = (questions: Question[], userId: number) =>
  questions.filter((question) => Number(question.userId ?? question.User?.id ?? question.user?.id) === userId);

export const getUserForumAnswers = (questions: Question[], userId: number) => {
  return questions.flatMap((question) =>
    (question.Answers ?? [])
      .filter((answer) => Number(answer.userId ?? answer.User?.id ?? answer.user?.id) === userId)
      .map((answer) => ({ answer, question }))
  );
};

const EmptyForumActivity = ({ type }: { type: UserForumActivityProps['type'] }) => (
  <div className="rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] px-6 py-10 text-center">
    <h2 className="text-xl font-bold text-gray-950">
      {type === 'questions' ? 'Nema forum pitanja' : 'Nema forum odgovora'}
    </h2>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600">
      {type === 'questions'
        ? 'Korisnik_ca još nije postavio_la pitanje na forumu.'
        : 'Korisnik_ca još nije odgovorio_la na forumu.'}
    </p>
  </div>
);

const QuestionActivityCard = ({ question }: { question: Question }) => (
  <Link
    to={`/forum/questions/${question.id}`}
    className="block rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-950">{question.title}</h3>
        <div className="mt-2 text-sm leading-6 text-gray-600">
          <ContentFormatter text={getPreview(question.body)} renderRichContent={false} />
        </div>
      </div>
      <span className="shrink-0 rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-2 text-sm font-semibold text-blue-dark">
        {getAnswerCount(question)} odgovora
      </span>
    </div>
    <RecordCreatedAt createdAt={question.createdAt} className="mt-4 !text-xs !text-gray-500" />
  </Link>
);

const AnswerActivityCard = ({
  answer,
  question,
}: {
  answer: Answer;
  question: Question;
}) => (
  <Link
    to={`/forum/questions/${question.id}`}
    className="block rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {answer.isAccepted && (
        <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">
          Prihvaćen odgovor
        </span>
      )}
      <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue-dark">
        {question.title}
      </span>
    </div>
    <div className="text-sm leading-6 text-gray-700">
      <ContentFormatter text={getPreview(answer.body)} renderRichContent={false} />
    </div>
    <RecordCreatedAt createdAt={answer.createdAt} className="mt-4 !text-xs !text-gray-500" />
  </Link>
);

const UserForumActivity = ({
  isError,
  isLoading,
  questions: providedQuestions,
  userId,
  type,
}: UserForumActivityProps) => {
  const numericUserId = Number(userId);
  const fallbackQuery = useQuestions({ page: 1, limit: 100 });
  const questions = providedQuestions ?? fallbackQuery.data?.data ?? [];
  const shouldShowLoading = isLoading ?? fallbackQuery.isPending;
  const shouldShowError = isError ?? fallbackQuery.isError;
  const userQuestions = Number.isFinite(numericUserId)
    ? getUserForumQuestions(questions, numericUserId)
    : [];
  const userAnswers = Number.isFinite(numericUserId)
    ? getUserForumAnswers(questions, numericUserId)
    : [];

  if (shouldShowLoading) {
    return (
      <div className="rounded-3xl border border-[#dce4ff] bg-white py-10">
        <Loader variant="inline" label="Učitavanje foruma..." />
      </div>
    );
  }

  if (shouldShowError) {
    return (
      <div className="rounded-3xl border border-red/30 bg-rose px-6 py-5 text-sm font-medium text-gray-800">
        Nije moguće učitati forum aktivnost.
      </div>
    );
  }

  if (type === 'questions') {
    if (userQuestions.length === 0) return <EmptyForumActivity type={type} />;

    return (
      <div className="grid gap-4">
        {userQuestions.map((question) => (
          <QuestionActivityCard key={question.id} question={question} />
        ))}
      </div>
    );
  }

  if (userAnswers.length === 0) return <EmptyForumActivity type={type} />;

  return (
    <div className="grid gap-4">
      {userAnswers.map(({ answer, question }) => (
        <AnswerActivityCard key={answer.id} answer={answer} question={question} />
      ))}
    </div>
  );
};

export default UserForumActivity;
