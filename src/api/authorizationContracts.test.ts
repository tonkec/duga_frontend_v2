import { createChat, deleteCurrentChat, leaveCurrentChat } from './chats';
import { sendChatMessage } from './chatMessages';
import { markAllAsReadNotifications, markAsReadNotification } from './notifications';
import { submitProblemReport } from './reports';
import { addUploadComment, deleteUploadComment, editUploadComment } from './uploadsComments';
import { deleteImage, uploadMessagePhotos, uploadPhotos } from './uploads';
import { addUploadLike, removeUploadLike } from './uploadsLikes';
import { deleteUser, updatePostLoginData, updateUser } from './users';
import { apiClient as relativeApiClient } from '.';
import { apiClient as aliasApiClient } from '@app/api';
import {
  addAnswerReaction,
  addAnswerReplyReaction,
  createAnswer,
  createAnswerReply,
  createQuestion,
  deleteAnswer,
  deleteAnswerReaction,
  deleteAnswerReply,
  deleteAnswerReplyReaction,
  deleteAnswerVote,
  deleteQuestion,
  deleteQuestionVote,
  updateAnswer,
  updateAnswerReply,
  updateQuestion,
  voteAnswer,
  voteQuestion,
} from '@app/features/forum/api/forumApi';

const post = jest.fn();
const put = jest.fn();
const patch = jest.fn();
const deleteRequest = jest.fn();

jest.mock('.', () => ({
  apiClient: jest.fn(),
}));

jest.mock('@app/api', () => ({
  apiClient: jest.fn(),
}));

const mockRelativeApiClient = jest.mocked(relativeApiClient);
const mockAliasApiClient = jest.mocked(aliasApiClient);

const FORBIDDEN_AUTHORIZATION_KEYS = [
  'userId',
  'ownerId',
  'reporterId',
  'fromUserId',
  'fromUser',
  'createdBy',
  'updatedBy',
  'deletedBy',
];

const collectPlainObjectKeys = (value: unknown): string[] => {
  if (!value || typeof value !== 'object' || value instanceof File || value instanceof Blob) {
    return [];
  }

  if (value instanceof FormData) {
    return Array.from(value.keys());
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectPlainObjectKeys);
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nestedValue]) => [
    key,
    ...collectPlainObjectKeys(nestedValue),
  ]);
};

const expectNoForbiddenAuthorizationKeys = (payload: unknown) => {
  const keys = collectPlainObjectKeys(payload);

  FORBIDDEN_AUTHORIZATION_KEYS.forEach((forbiddenKey) => {
    expect(keys).not.toContain(forbiddenKey);
  });
};

const questionResponse = () => ({
  id: 1,
  userId: 7,
  title: 'Question',
  body: 'Question body',
  isResolved: false,
  createdAt: '2026-05-27T00:00:00.000Z',
  updatedAt: '2026-05-27T00:00:00.000Z',
});

const answerResponse = () => ({
  id: 2,
  questionId: 1,
  userId: 7,
  body: 'Answer body',
  isAccepted: false,
  createdAt: '2026-05-27T00:00:00.000Z',
  updatedAt: '2026-05-27T00:00:00.000Z',
});

const answerReplyResponse = () => ({
  id: 3,
  answerId: 2,
  userId: 7,
  body: 'Reply body',
  createdAt: '2026-05-27T00:00:00.000Z',
  updatedAt: '2026-05-27T00:00:00.000Z',
});

const createUploadFormData = () => {
  const formData = new FormData();
  formData.append('text', JSON.stringify([{ imageId: 'photo.png', description: 'Photo' }]));
  formData.append('avatars', new File(['image'], 'photo.png', { type: 'image/png' }));
  return formData;
};

describe('authorization API contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const client = {
      delete: deleteRequest,
      patch,
      post,
      put,
    } as unknown as ReturnType<typeof relativeApiClient>;

    mockRelativeApiClient.mockReturnValue(client);
    mockAliasApiClient.mockReturnValue(client);
    post.mockResolvedValue({
      data: { data: questionResponse() },
    });
    patch.mockResolvedValue({
      data: { data: questionResponse() },
    });
    deleteRequest.mockResolvedValue({});
    put.mockResolvedValue({});
  });

  it('does not send actor fields for users, reports, or notifications', async () => {
    await updateUser({
      age: '33',
      alcohol: false,
      bio: 'Bio',
      cigarettes: false,
      embarasement: 'None',
      ending: 'End',
      favoriteDay: 'Friday',
      favoriteMovie: 'Movie',
      favoriteSong: 'Song',
      gender: 'Other',
      interests: 'Reading',
      languages: 'Croatian',
      location: 'Zagreb',
      lookingFor: 'Friends',
      makesMyDay: 'Coffee',
      relationshipStatus: 'Single',
      sexuality: 'Queer',
      spirituality: 'None',
      sport: false,
      tooOldFor: 'Drama',
    });
    await updatePostLoginData({
      username: 'new-user',
      age: 33,
      acceptPrivacy: true,
      acceptTerms: true,
    });
    await deleteUser();
    await submitProblemReport({ problemType: 'harassment', message: 'Problem report message.' });
    await markAsReadNotification('99');
    await markAllAsReadNotifications();

    const mutationPayloads = [
      post.mock.calls[0][1],
      post.mock.calls[1][1],
      post.mock.calls[2][1],
      put.mock.calls[0][1],
      put.mock.calls[1][1],
    ];

    mutationPayloads.forEach(expectNoForbiddenAuthorizationKeys);
    expect(deleteRequest).toHaveBeenCalledWith('/delete-user');
    expect(put).toHaveBeenNthCalledWith(1, '/notifications/99/read', undefined, {
      skipGlobalErrorHandler: true,
    });
    expect(put).toHaveBeenNthCalledWith(2, '/notifications/mark-all-read', undefined, {
      skipGlobalErrorHandler: true,
    });
  });

  it('uses opaque resource IDs for upload, comment, like, chat, and message mutations', async () => {
    const uploadFormData = createUploadFormData();
    const messagePhotoFormData = createUploadFormData();
    const commentFormData = new FormData();
    commentFormData.append('uploadId', '42');
    commentFormData.append('comment', 'Comment');

    await uploadPhotos(uploadFormData);
    await uploadMessagePhotos(messagePhotoFormData);
    await deleteImage('development/user/54/photo.png');
    await addUploadComment(commentFormData);
    await editUploadComment(101, 'Edited comment', [7, 8]);
    await deleteUploadComment(101);
    await addUploadLike({ uploadId: '42' });
    await removeUploadLike({ uploadId: '42' });
    await createChat({ partnerPublicId: 'public-partner-id' });
    await deleteCurrentChat('55');
    await leaveCurrentChat('55');
    await sendChatMessage({ chatId: 55, type: 'text', message: 'Hello', mentions: [7] });

    [uploadFormData, messagePhotoFormData, commentFormData].forEach(
      expectNoForbiddenAuthorizationKeys
    );
    expectNoForbiddenAuthorizationKeys(put.mock.calls[0][1]);
    post.mock.calls.forEach(([, payload]) => expectNoForbiddenAuthorizationKeys(payload));
    expect(deleteRequest).toHaveBeenCalledWith('/uploads/delete-photo', {
      data: {
        url: 'development/user/54/photo.png',
      },
      skipGlobalErrorHandler: true,
    });
    expect(deleteRequest).toHaveBeenCalledWith('/comments/delete-comment/101');
    expect(deleteRequest).toHaveBeenCalledWith('/chats/55');
  });

  it('keeps forum ownership and moderation decisions out of mutation payloads', async () => {
    post.mockResolvedValueOnce({ data: { data: questionResponse() } });
    patch.mockResolvedValueOnce({ data: { data: questionResponse() } });
    post.mockResolvedValueOnce({ data: { data: answerResponse() } });
    patch.mockResolvedValueOnce({ data: { data: answerResponse() } });
    post.mockResolvedValueOnce({ data: { data: questionResponse() } });
    post.mockResolvedValueOnce({ data: { data: answerResponse() } });
    post.mockResolvedValueOnce({ data: { data: answerResponse() } });
    deleteRequest.mockResolvedValueOnce({ data: { data: answerResponse() } });
    post.mockResolvedValueOnce({ data: { data: answerReplyResponse() } });
    patch.mockResolvedValueOnce({ data: { data: answerReplyResponse() } });
    post.mockResolvedValueOnce({ data: { data: answerReplyResponse() } });
    deleteRequest.mockResolvedValueOnce({ data: { data: answerReplyResponse() } });

    await createQuestion({ title: 'Question', body: 'Body', taggedUserIds: [7] });
    await updateQuestion(1, { title: 'Updated question', removeImage: true });
    await deleteQuestion(1);
    await voteQuestion(1, { value: 1 });
    await deleteQuestionVote(1);
    await createAnswer(1, { body: 'Answer', taggedUserIds: [7] });
    await updateAnswer(2, { body: 'Updated answer' });
    await deleteAnswer(2);
    await voteAnswer(2, { value: -1 });
    await deleteAnswerVote(2);
    await addAnswerReaction(2, { emoji: '👍' });
    await deleteAnswerReaction(2, { emoji: '👍' });
    await createAnswerReply(2, { body: 'Reply' });
    await updateAnswerReply(3, { body: 'Updated reply' });
    await deleteAnswerReply(3);
    await addAnswerReplyReaction(3, { emoji: '❤️' });
    await deleteAnswerReplyReaction(3, { emoji: '❤️' });

    [...post.mock.calls, ...patch.mock.calls].forEach(([, payload]) =>
      expectNoForbiddenAuthorizationKeys(payload)
    );
    deleteRequest.mock.calls.forEach(([, config]) => expectNoForbiddenAuthorizationKeys(config));
  });
});
