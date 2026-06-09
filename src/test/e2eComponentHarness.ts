import { createElement as h, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import ContentFormatter from '@app/components/ContentFormatter';
import Divider from '@app/components/Divider';
import EmojiSearch from '@app/components/EmojiSearch';
import FieldError from '@app/components/FieldError';
import LatestComments, { LatestComment } from '@app/components/LatestComments';
import LatestMessages from '@app/components/LatestMessages';
import LatestUploads from '@app/components/LatestUploads';
import LatestUpload from '@app/components/LatestUploads/components/LatestUpload';
import Notification from '@app/components/Navigation/components/Notification';
import type { INotification } from '@app/components/Navigation/components/Notifications';
import Paginated from '@app/components/Paginated';
import Photos, { IImage } from '@app/components/Photos';
import AnswerCard from '@app/features/forum/components/AnswerCard';
import ForumImage from '@app/features/forum/components/ForumImage';
import ForumImageGallery from '@app/features/forum/components/ForumImageGallery';
import UserForumActivity from '@app/features/forum/components/UserForumActivity';
import VoteControls from '@app/features/forum/components/VoteControls';
import {
  forumQueryKeys,
  useAcceptAnswer,
  useAddAnswerReaction,
  useAddAnswerReplyReaction,
  useCreateAnswer,
  useCreateAnswerReply,
  useCreateQuestion,
  useDeleteAnswer,
  useDeleteAnswerImage,
  useDeleteAnswerReaction,
  useDeleteAnswerReply,
  useDeleteAnswerReplyReaction,
  useDeleteAnswerVote,
  useDeleteQuestion,
  useDeleteQuestionImage,
  useDeleteQuestionVote,
  useUpdateAnswer,
  useUpdateAnswerReply,
  useUpdateQuestion,
  useVoteAnswer,
  useVoteQuestion,
} from '@app/features/forum/hooks/useForum';

const sampleImage: IImage = {
  id: 901,
  createdAt: '2026-06-08T09:30:00.000Z',
  updatedAt: '2026-06-08T09:30:00.000Z',
  description: 'Opis s linkom https://youtu.be/dQw4w9WgXcQ i @alex',
  fileType: 'image/png',
  isProfilePhoto: false,
  name: 'sample.png',
  url: 'development/user/sample.png',
  userId: '2',
  securePhotoUrl: 'development/user/sample.png',
  taggedUsers: [{ id: 2, username: 'alex' }],
};

const PaginatedCard = ({ singleEntry }: { singleEntry: { id: number; label: string } }) =>
  h('button', { type: 'button' }, `Item ${singleEntry.label}`);

const forumActivityQuestion = {
  id: 501,
  userId: 2,
  title: 'Forum aktivnost pitanje',
  body: 'Ovo je dugačak tekst pitanja koji pokriva preview granu u aktivnosti korisnika.',
  createdAt: '2026-06-08T09:30:00.000Z',
  answerCount: 0,
  Answers: [
    {
      id: 601,
      questionId: 501,
      userId: 2,
      body: 'Prihvaćen odgovor korisnika za prikaz aktivnosti.',
      isAccepted: true,
      createdAt: '2026-06-08T09:35:00.000Z',
    },
    {
      id: 602,
      questionId: 501,
      userId: 3,
      body: 'Odgovor drugog korisnika.',
      isAccepted: false,
      createdAt: '2026-06-08T09:40:00.000Z',
    },
  ],
};

const notificationSetState = (
  next: INotification[] | ((currentNotifications: INotification[]) => INotification[])
) => {
  if (typeof next === 'function') {
    next([]);
  }
};

const notifications: INotification[] = [
  {
    id: 901,
    userId: 1,
    type: 'message',
    content: 'Nova poruka u chatu',
    isRead: false,
    createdAt: '2026-06-08T09:30:00.000Z',
    actionId: null,
    actionType: 'message',
    chatId: 44,
  },
  {
    id: 902,
    userId: 1,
    type: 'upload',
    content: 'Netko je lajkao tvoju fotku.',
    isRead: true,
    createdAt: '2026-06-08T09:31:00.000Z',
    actionId: 901,
    actionType: 'upload',
  },
  {
    id: 903,
    userId: 1,
    type: 'forum_question',
    content: 'Netko je upvoteao tvoje pitanje.',
    isRead: false,
    createdAt: '2026-06-08T09:32:00.000Z',
    actionId: 501,
    actionType: 'forum_question',
  },
  {
    id: 904,
    userId: 1,
    type: 'forum_answer',
    content: 'Netko je odgovorio na tvoje pitanje.',
    isRead: false,
    createdAt: '2026-06-08T09:33:00.000Z',
    actionId: 501,
    actionType: 'forum_answer',
    questionId: 501,
  },
  {
    id: 905,
    userId: 1,
    type: 'forum_answer',
    content: 'Netko je odgovorio na tvoj odgovor.',
    isRead: false,
    createdAt: '2026-06-08T09:34:00.000Z',
    actionId: 601,
    actionType: 'forum_answer',
    answerId: 601,
  },
  {
    id: 906,
    userId: 1,
    type: 'system',
    content: 'Obična obavijest',
    isRead: true,
    createdAt: '2026-06-08T09:35:00.000Z',
    actionId: null,
    actionType: null,
  },
];

const answerCallbacks = {
  onAccept: () => undefined,
  onDelete: () => undefined,
  onDeleteImage: () => undefined,
  onUpdate: () => undefined,
  onAddReaction: () => undefined,
  onDeleteReaction: () => undefined,
  onCreateReply: () => undefined,
  onUpdateReply: () => undefined,
  onDeleteReply: () => undefined,
  onAddReplyReaction: () => undefined,
  onDeleteReplyReaction: () => undefined,
};

const ownForumAnswer = {
  id: 701,
  questionId: 501,
  userId: 1,
  body: 'Moj odgovor s postojećom slikom i odgovorima.',
  isAccepted: false,
  createdAt: '2026-06-08T09:30:00.000Z',
  securePhotoUrl: 'development/forum/answers/own.png',
  User: { id: 1, username: 'current', publicId: 'current-public' },
  reactions: [{ emoji: '❤️', count: 1, userIds: [1] }],
  userReactions: ['❤️'],
  replies: [
    {
      id: 901,
      answerId: 701,
      userId: 1,
      body: 'Moj reply na odgovor.',
      createdAt: '2026-06-08T09:35:00.000Z',
      User: { id: 1, username: 'current', publicId: 'current-public' },
      reactions: [{ emoji: '🎉', count: 1, userIds: [1] }],
      userReactions: ['🎉'],
    },
    {
      id: 902,
      answerId: 701,
      userId: 2,
      body: 'Tuđi reply na odgovor.',
      createdAt: '2026-06-08T09:40:00.000Z',
      user: { id: 2, username: 'alex', publicId: 'alex-public' },
      reactions: [],
    },
  ],
};

const acceptedForumAnswer = {
  id: 702,
  questionId: 501,
  userId: 2,
  body: 'Prihvaćen odgovor druge osobe.',
  isAccepted: true,
  createdAt: '2026-06-08T09:45:00.000Z',
  User: { id: 2, username: 'alex', publicId: 'alex-public' },
  reactions: [{ emoji: '👍', count: 2, users: [{ id: 1 }, { id: 2 }] }],
  replies: [],
};

const ForumHookCoverage = () => {
  const hookQueryClient = useQueryClient();
  const currentUser = { id: 1, username: 'current', publicId: 'current-public' };
  const createQuestion = useCreateQuestion();
  const createAnswer = useCreateAnswer(501, currentUser);
  const acceptAnswer = useAcceptAnswer(501);
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const deleteQuestionImage = useDeleteQuestionImage();
  const updateAnswer = useUpdateAnswer();
  const deleteAnswer = useDeleteAnswer(501);
  const deleteAnswerWithoutQuestion = useDeleteAnswer();
  const deleteAnswerImage = useDeleteAnswerImage(501);
  const voteQuestion = useVoteQuestion(501);
  const deleteQuestionVote = useDeleteQuestionVote(501);
  const voteAnswer = useVoteAnswer(501);
  const deleteAnswerVote = useDeleteAnswerVote(501);
  const addAnswerReaction = useAddAnswerReaction(501);
  const deleteAnswerReaction = useDeleteAnswerReaction(501);
  const addAnswerReplyReaction = useAddAnswerReplyReaction(501);
  const deleteAnswerReplyReaction = useDeleteAnswerReplyReaction(501);
  const createAnswerReply = useCreateAnswerReply(501, currentUser);
  const updateAnswerReply = useUpdateAnswerReply(501);
  const deleteAnswerReply = useDeleteAnswerReply(501);

  useEffect(() => {
    const question = {
      id: 501,
      userId: 2,
      title: 'Hook pitanje',
      body: 'Pitanje za hook coverage.',
      createdAt: '2026-06-08T09:30:00.000Z',
      Answers: [ownForumAnswer, acceptedForumAnswer],
      answerCount: 2,
      voteScore: 2,
      currentUserVote: 1,
    };
    hookQueryClient.setQueryData(forumQueryKeys.question(501), question);
    hookQueryClient.setQueryData(forumQueryKeys.questions({ page: 1, limit: 10 }), {
      data: [question],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    createQuestion.mutate({ title: 'Novo hook pitanje', body: 'Dovoljno dugo pitanje.' });
    createAnswer.mutate({ body: 'Novi hook odgovor' });
    acceptAnswer.mutate(701);
    updateQuestion.mutate({
      id: 501,
      payload: { title: 'Uredi hook pitanje', body: 'Uredi body' },
    });
    deleteQuestionImage.mutate(501);
    voteQuestion.mutate({ value: 1 });
    deleteQuestionVote.mutate();
    updateAnswer.mutate({ id: 701, payload: { body: 'Uredi odgovor hook' } });
    deleteAnswerImage.mutate(701);
    voteAnswer.mutate({ answerId: 701, payload: { value: -1 } });
    deleteAnswerVote.mutate(701);
    addAnswerReaction.mutate({ answerId: 701, payload: { emoji: '🙏' } });
    deleteAnswerReaction.mutate({ answerId: 701, payload: { emoji: '❤️' } });
    createAnswerReply.mutate({ answerId: 701, payload: { body: 'Novi reply hook' } });
    updateAnswerReply.mutate({ id: 901, payload: { body: 'Uredi reply hook' } });
    deleteAnswerReply.mutate(902);
    addAnswerReplyReaction.mutate({ replyId: 901, payload: { emoji: '👍' } });
    deleteAnswerReplyReaction.mutate({ replyId: 901, payload: { emoji: '🎉' } });
    deleteAnswer.mutate(702);
    deleteAnswerWithoutQuestion.mutate(701);
    deleteQuestion.mutate(501);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return h('div', { 'data-testid': 'forum-hook-coverage' }, 'Forum hooks exercised');
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
    mutations: { retry: false },
  },
});

const Harness = () =>
  h(
    QueryClientProvider,
    { client: queryClient },
    h(
      MemoryRouter,
      null,
      h(
        'div',
        { 'data-testid': 'component-coverage-harness' },
        h(Divider, { width: 120, height: 2, className: 'coverage-divider' }),
        h(FieldError, { message: 'Greška za pokrivanje', className: 'coverage-error' }),
        h(FieldError, { message: '' }),
        h(FieldError, { message: 'Samobrišuća greška', isSelfRemoving: true }),
        h(Paginated, {
          data: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
          ],
          itemsPerPage: 1,
          getItemKey: (item: { id: number }) => item.id,
          paginatedSingle: PaginatedCard,
        }),
        h(Paginated, { data: [], paginatedSingle: PaginatedCard }),
        h(EmojiSearch, {
          isOpen: true,
          onClose: () => undefined,
          onEmojiSelect: () => undefined,
        }),
        h(EmojiSearch, {
          isOpen: false,
          onClose: () => undefined,
          onEmojiSelect: () => undefined,
        }),
        h(ContentFormatter, {
          text: 'Pogledaj https://www.youtube.com/watch?v=dQw4w9WgXcQ i https://media0.giphy.com/media/demo/giphy.gif',
          renderRichContent: true,
        }),
        h(ContentFormatter, {
          text: '@alex običan tekst',
          taggedUsers: [{ id: 2, username: 'alex' }],
        }),
        h(ContentFormatter, {
          text: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ https://media0.giphy.com/media/demo/giphy.gif /uploads/files/development/user/inline.png',
          renderRichContent: false,
        }),
        h(ContentFormatter, {
          text: 'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/s3.png https://evil.test/image.png https://example.com/page /user/123e4567-e89b-12d3-a456-426614174000',
          renderRichContent: true,
        }),
        h(ContentFormatter, { text: '😀 🎉' }),
        h(ContentFormatter, { text: null }),
        h(VoteControls, {
          item: { voteScore: 0, currentUserVote: null },
          isPending: false,
          onVote: () => undefined,
          onClearVote: () => undefined,
        }),
        h(VoteControls, {
          item: { score: 3, currentUserVote: 1 },
          isPending: false,
          onVote: () => undefined,
          onClearVote: () => undefined,
        }),
        h(VoteControls, {
          item: { upvotes: 4, downvotes: 1, currentUserVote: -1 },
          isPending: true,
          onVote: () => undefined,
          onClearVote: () => undefined,
        }),
        h(Photos, { images: [], notFoundText: 'Nema slika' }),
        h(Photos, {
          images: [sampleImage, { ...sampleImage, id: 902, securePhotoUrl: '' }],
          notFoundText: 'Nema',
        }),
        h(ForumImage, {
          alt: 'Forum remote',
          imageUrl: 'https://media0.giphy.com/media/demo/giphy.gif',
        }),
        h(ForumImage, { alt: 'Forum missing', imageUrl: '' }),
        h(ForumImageGallery, {
          alt: 'Forum gallery',
          item: {
            imageUrl: 'https://media0.giphy.com/media/forum-one/giphy.gif',
            imageUrls: ['https://media0.giphy.com/media/forum-two/giphy.gif'],
          },
        }),
        h(UserForumActivity, { userId: 2, type: 'questions', isLoading: true, questions: [] }),
        h(UserForumActivity, { userId: 2, type: 'questions', isError: true, questions: [] }),
        h(UserForumActivity, {
          userId: 999,
          type: 'questions',
          questions: [forumActivityQuestion],
        }),
        h(UserForumActivity, { userId: 999, type: 'answers', questions: [forumActivityQuestion] }),
        h(UserForumActivity, { userId: 2, type: 'questions', questions: [forumActivityQuestion] }),
        h(UserForumActivity, { userId: 2, type: 'answers', questions: [forumActivityQuestion] }),
        h(
          'div',
          { 'data-testid': 'notification-coverage-cards' },
          notifications.map((notification) =>
            h(Notification, {
              key: notification.id,
              n: notification,
              setNotifications: notificationSetState,
            })
          )
        ),
        h(AnswerCard, {
          answer: ownForumAnswer,
          canAccept: false,
          hasAcceptedAnswer: false,
          currentUserId: 1,
          isAccepting: false,
          isDeletingImage: false,
          isDeleting: false,
          isUpdating: false,
          isReactionPending: false,
          isReplyPending: false,
          isReplyReactionPending: false,
          ...answerCallbacks,
        }),
        h(AnswerCard, {
          answer: acceptedForumAnswer,
          canAccept: true,
          hasAcceptedAnswer: true,
          currentUserId: 1,
          isAccepting: true,
          isDeletingImage: true,
          isDeleting: true,
          isUpdating: true,
          isReactionPending: true,
          isReplyPending: true,
          isReplyReactionPending: true,
          ...answerCallbacks,
        }),
        h(ForumHookCoverage),
        h(LatestUpload, {
          upload: {
            id: '777',
            userId: '2',
            userPublicId: 'alex-public',
            url: 'development/user/latest.png',
            securePhotoUrl: 'development/user/latest.png',
            User: {
              publicId: 'alex-public',
              profilePhoto: { imageUrl: 'development/user/avatar.png' },
            },
          },
        }),
        h(LatestComments),
        h(LatestComment, {
          comment: {
            id: 701,
            comment: 'Komentar s @alex i <strong>html</strong>',
            createdAt: '2026-06-08T09:30:00.000Z',
            uploadId: 901,
            userId: 2,
            userPublicId: 'alex-public',
            taggedUsers: [{ id: 2, publicId: 'alex-public', username: 'alex' }],
            imageUrl: 'development/user/comment.png',
          },
          onClick: () => undefined,
        }),
        h(LatestUploads),
        h(LatestMessages)
      )
    )
  );

let activeRoot: Root | undefined;

export const renderCoverageComponentHarness = (container: HTMLElement) => {
  activeRoot?.unmount();
  activeRoot = createRoot(container);
  activeRoot.render(h(Harness));

  return () => {
    activeRoot?.unmount();
    activeRoot = undefined;
  };
};
