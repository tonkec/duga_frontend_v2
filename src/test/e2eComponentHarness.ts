import { createElement as h } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
