import { useNavigate } from 'react-router';
import { useMarkAsReadNotification } from '../../hooks';
import { INotification } from '../Notifications';
import { BiBell, BiCheckCircle, BiMessageRoundedDots, BiUpvote } from 'react-icons/bi';
import { getQuestion, getQuestions } from '@app/features/forum/api/forumApi';

const isReplyToAnswerNotification = (notification: INotification) =>
  notification.actionType === 'forum_answer' &&
  notification.content.toLowerCase().includes('tvoj odgovor');

const getForumAnswerQuestionId = async (answerId: number) => {
  const questions = await getQuestions({ page: 1, limit: 100 });
  const questionFromList = questions.data.find((question) =>
    question.Answers?.some((answer) => answer.id === answerId)
  );

  if (questionFromList) return questionFromList.id;

  for (const question of questions.data) {
    const questionDetails = await getQuestion(question.id);
    if (questionDetails.Answers?.some((answer) => answer.id === answerId)) {
      return questionDetails.id;
    }
  }

  return undefined;
};

const getNotificationContent = (content: string) => {
  if (content === 'Netko je upvoteao tvoje pitanje.') {
    return 'Netko je dao glas tvom pitanju.';
  }

  return content;
};

interface INotificationProps {
  n: INotification;
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
}

const Notification = ({ n, setNotifications }: INotificationProps) => {
  const { mutateMarkAsRead } = useMarkAsReadNotification();
  const navigate = useNavigate();
  const isForumNotification = n.actionType === 'forum_question' || n.actionType === 'forum_answer';
  const Icon =
    n.actionType === 'message'
      ? BiMessageRoundedDots
      : n.actionType === 'forum_answer'
        ? BiMessageRoundedDots
        : isForumNotification
          ? BiUpvote
          : n.isRead
            ? BiCheckCircle
            : BiBell;

  const navigateToNotificationTarget = async () => {
    if (!n.actionType) return;

    switch (n.actionType) {
      case 'upload':
        if (n.actionId) navigate(`/photo/${n.actionId}`);
        break;
      case 'comment':
        if (n.actionId) navigate(`/photo/${n.actionId}`);
        break;
      case 'message': {
        const chatId = n.chatId ?? n.actionId;
        if (chatId) navigate(`/chat/${chatId}`);
        break;
      }
      case 'forum_question':
        if (n.actionId) navigate(`/forum/questions/${n.actionId}`);
        break;
      case 'forum_answer': {
        const directQuestionId =
          n.questionId ?? (!isReplyToAnswerNotification(n) ? n.actionId : null);
        if (directQuestionId) {
          navigate(`/forum/questions/${directQuestionId}`);
          break;
        }

        const answerId = n.answerId ?? n.actionId;
        const questionId = answerId ? await getForumAnswerQuestionId(answerId) : undefined;
        navigate(questionId ? `/forum/questions/${questionId}` : '/forum');
        break;
      }
      default:
        break;
    }
  };

  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 text-left text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue/50 hover:bg-[#eef3ff] hover:shadow-md hover:shadow-blue/10 ${
        n.isRead
          ? 'border-[#dce4ff] bg-white text-gray-700'
          : 'border-blue/30 bg-white font-semibold text-gray-950 shadow-blue/10'
      }`}
      onClick={() => {
        if (!n.isRead) {
          mutateMarkAsRead(String(n.id));
          setNotifications((prev) =>
            prev.map((notification: INotification) =>
              notification.id === n.id ? { ...notification, isRead: true } : notification
            )
          );
        }

        void navigateToNotificationTarget();
      }}
    >
      <span
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          n.isRead ? 'bg-[#f0f4ff] text-blue' : 'bg-blue text-white'
        }`}
      >
        <Icon fontSize={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-6">{getNotificationContent(n.content)}</span>
        <span className="mt-1 block text-xs font-medium text-gray-500">
          {n.isRead ? 'Pročitano' : 'Novo'}
        </span>
      </span>
      {!n.isRead && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red" />}
    </button>
  );
};

export default Notification;
