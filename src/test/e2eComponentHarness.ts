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
import Paginated from '@app/components/Paginated';
import Photos, { IImage } from '@app/components/Photos';
import ForumImage from '@app/features/forum/components/ForumImage';
import ForumImageGallery from '@app/features/forum/components/ForumImageGallery';
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
