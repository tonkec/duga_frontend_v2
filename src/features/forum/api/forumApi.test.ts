import { apiClient } from '@app/api';
import {
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteAnswerImage,
  deleteAnswerVote,
  deleteQuestion,
  deleteQuestionImage,
  deleteQuestionVote,
  getQuestion,
  getQuestions,
  updateAnswer,
  updateQuestion,
  voteAnswer,
  voteQuestion,
} from './forumApi';
import type { Answer, Question } from '../types/forum.types';

jest.mock('@app/api', () => ({
  apiClient: jest.fn(),
}));

const mockApiClient = jest.mocked(apiClient);
const get = jest.fn();
const post = jest.fn();
const patch = jest.fn();
const deleteRequest = jest.fn();

const client = {
  get,
  post,
  patch,
  delete: deleteRequest,
};

const createImage = (name: string) => new File(['image-content'], name, { type: 'image/png' });

const questionResponse = (overrides: Partial<Question> = {}): Question => ({
  id: 1,
  userId: 7,
  title: 'Kako radi forum?',
  body: 'Trebam pomoć oko foruma.',
  imageUrl: null,
  securePhotoUrl: null,
  isResolved: false,
  createdAt: '2026-05-25T10:00:00.000Z',
  updatedAt: '2026-05-25T10:00:00.000Z',
  answerCount: 0,
  Answers: [],
  User: {
    id: 7,
    username: 'ana',
    firstName: 'Ana',
    lastName: 'Test',
    avatar: 'avatar.png',
  },
  ...overrides,
});

const answerResponse = (overrides: Partial<Answer> = {}): Answer => ({
  id: 11,
  questionId: 1,
  userId: 8,
  body: 'Ovo je odgovor.',
  imageUrl: null,
  securePhotoUrl: null,
  isAccepted: false,
  createdAt: '2026-05-25T10:05:00.000Z',
  updatedAt: '2026-05-25T10:05:00.000Z',
  voteScore: 0,
  voteCount: 0,
  User: {
    id: 8,
    username: 'ivo',
    firstName: 'Ivo',
    lastName: 'Test',
    avatar: 'ivo.png',
  },
  ...overrides,
});

describe('forumApi CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.mockReturnValue(client as unknown as ReturnType<typeof apiClient>);
  });

  describe('questions', () => {
    it('fetches and normalizes paginated questions', async () => {
      const answer = answerResponse({ id: 20 });
      get.mockResolvedValue({
        data: {
          data: [
            questionResponse({
              answerCount: 0,
              Answers: [answer],
              voteScore: '3' as unknown as number,
            }),
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      });

      const result = await getQuestions({ page: 1, limit: 10, search: 'forum' });

      expect(get).toHaveBeenCalledWith('/forum/questions', {
        params: { page: 1, limit: 10, search: 'forum' },
        skipGlobalErrorHandler: true,
      });
      expect(result.data[0].answerCount).toBe(1);
      expect(result.data[0].voteScore).toBe(3);
      expect(result.data[0].User?.name).toBe('Ana Test');
      expect(result.data[0].User?.picture).toBe('avatar.png');
    });

    it('fetches one question and unwraps data responses', async () => {
      get.mockResolvedValue({ data: { data: questionResponse({ id: 42 }) } });

      const result = await getQuestion(42);

      expect(get).toHaveBeenCalledWith('/forum/questions/42', {
        skipGlobalErrorHandler: true,
      });
      expect(result.id).toBe(42);
    });

    it('creates a question with multipart data and multiple images', async () => {
      const firstImage = createImage('question-1.png');
      const secondImage = createImage('question-2.png');
      post.mockResolvedValue({ data: { data: questionResponse({ id: 101 }) } });

      const result = await createQuestion({
        title: 'Novo pitanje',
        body: 'Opis pitanja',
        categoryId: 5,
        images: [firstImage, secondImage],
      });

      expect(post).toHaveBeenCalledWith('/forum/questions', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipGlobalErrorHandler: true,
      });

      const formData = post.mock.calls[0][1] as FormData;
      expect(formData.get('title')).toBe('Novo pitanje');
      expect(formData.get('body')).toBe('Opis pitanja');
      expect(formData.get('categoryId')).toBe('5');
      expect(formData.getAll('questionImage')).toEqual([firstImage, secondImage]);
      expect(result.id).toBe(101);
    });

    it('updates a question with removeImage flag', async () => {
      const image = createImage('replacement.png');
      patch.mockResolvedValue({ data: questionResponse({ title: 'Uređeno pitanje' }) });

      const result = await updateQuestion(1, {
        title: 'Uređeno pitanje',
        images: [image],
        removeImage: true,
      });

      expect(patch).toHaveBeenCalledWith('/forum/questions/1', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipGlobalErrorHandler: true,
      });

      const formData = patch.mock.calls[0][1] as FormData;
      expect(formData.get('title')).toBe('Uređeno pitanje');
      expect(formData.getAll('questionImage')).toEqual([image]);
      expect(formData.get('removeImage')).toBe('true');
      expect(result.title).toBe('Uređeno pitanje');
    });

    it('deletes a question', async () => {
      deleteRequest.mockResolvedValue({});

      await deleteQuestion(1);

      expect(deleteRequest).toHaveBeenCalledWith('/forum/questions/1', {
        skipGlobalErrorHandler: true,
      });
    });

    it('deletes an existing question image', async () => {
      deleteRequest.mockResolvedValue({});

      await deleteQuestionImage(1);

      expect(deleteRequest).toHaveBeenCalledWith('/forum/questions/1/image', {
        skipGlobalErrorHandler: true,
      });
    });

    it('upvotes and downvotes a question', async () => {
      post.mockResolvedValueOnce({
        data: { data: questionResponse({ id: 1, voteScore: 1, currentUserVote: 1 }) },
      });
      post.mockResolvedValueOnce({
        data: { data: questionResponse({ id: 1, voteScore: -1, currentUserVote: -1 }) },
      });

      const upvotedQuestion = await voteQuestion(1, { value: 1 });
      const downvotedQuestion = await voteQuestion(1, { value: -1 });

      expect(post).toHaveBeenNthCalledWith(
        1,
        '/forum/questions/1/votes',
        { value: 1 },
        {
          skipGlobalErrorHandler: true,
        }
      );
      expect(post).toHaveBeenNthCalledWith(
        2,
        '/forum/questions/1/votes',
        { value: -1 },
        {
          skipGlobalErrorHandler: true,
        }
      );
      expect(upvotedQuestion.voteScore).toBe(1);
      expect(upvotedQuestion.currentUserVote).toBe(1);
      expect(downvotedQuestion.voteScore).toBe(-1);
      expect(downvotedQuestion.currentUserVote).toBe(-1);
    });

    it('clears a question vote', async () => {
      deleteRequest.mockResolvedValue({});

      await deleteQuestionVote(1);

      expect(deleteRequest).toHaveBeenCalledWith('/forum/questions/1/votes', {
        skipGlobalErrorHandler: true,
      });
    });
  });

  describe('answers', () => {
    it('creates an answer with multipart data and multiple images', async () => {
      const firstImage = createImage('answer-1.png');
      const secondImage = createImage('answer-2.png');
      post.mockResolvedValue({ data: { data: answerResponse({ id: 55 }) } });

      const result = await createAnswer(1, {
        body: 'Novi odgovor',
        images: [firstImage, secondImage],
      });

      expect(post).toHaveBeenCalledWith('/forum/questions/1/answers', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipGlobalErrorHandler: true,
      });

      const formData = post.mock.calls[0][1] as FormData;
      expect(formData.get('body')).toBe('Novi odgovor');
      expect(formData.getAll('answerImage')).toEqual([firstImage, secondImage]);
      expect(result.id).toBe(55);
      expect(result.User?.name).toBe('Ivo Test');
    });

    it('updates an answer with removeImage flag', async () => {
      const image = createImage('answer-replacement.png');
      patch.mockResolvedValue({ data: answerResponse({ body: 'Uređen odgovor' }) });

      const result = await updateAnswer(11, {
        body: 'Uređen odgovor',
        images: [image],
        removeImage: true,
      });

      expect(patch).toHaveBeenCalledWith('/forum/answers/11', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipGlobalErrorHandler: true,
      });

      const formData = patch.mock.calls[0][1] as FormData;
      expect(formData.get('body')).toBe('Uređen odgovor');
      expect(formData.getAll('answerImage')).toEqual([image]);
      expect(formData.get('removeImage')).toBe('true');
      expect(result.body).toBe('Uređen odgovor');
    });

    it('deletes an answer', async () => {
      deleteRequest.mockResolvedValue({});

      await deleteAnswer(11);

      expect(deleteRequest).toHaveBeenCalledWith('/forum/answers/11', {
        skipGlobalErrorHandler: true,
      });
    });

    it('deletes an existing answer image', async () => {
      deleteRequest.mockResolvedValue({});

      await deleteAnswerImage(11);

      expect(deleteRequest).toHaveBeenCalledWith('/forum/answers/11/image', {
        skipGlobalErrorHandler: true,
      });
    });

    it('upvotes and downvotes an answer', async () => {
      post.mockResolvedValueOnce({
        data: { data: answerResponse({ id: 11, voteScore: 1, currentUserVote: 1 }) },
      });
      post.mockResolvedValueOnce({
        data: { data: answerResponse({ id: 11, voteScore: -1, currentUserVote: -1 }) },
      });

      const upvotedAnswer = await voteAnswer(11, { value: 1 });
      const downvotedAnswer = await voteAnswer(11, { value: -1 });

      expect(post).toHaveBeenNthCalledWith(
        1,
        '/forum/answers/11/votes',
        { value: 1 },
        {
          skipGlobalErrorHandler: true,
        }
      );
      expect(post).toHaveBeenNthCalledWith(
        2,
        '/forum/answers/11/votes',
        { value: -1 },
        {
          skipGlobalErrorHandler: true,
        }
      );
      expect(upvotedAnswer.voteScore).toBe(1);
      expect(upvotedAnswer.currentUserVote).toBe(1);
      expect(downvotedAnswer.voteScore).toBe(-1);
      expect(downvotedAnswer.currentUserVote).toBe(-1);
    });

    it('clears an answer vote', async () => {
      deleteRequest.mockResolvedValue({});

      await deleteAnswerVote(11);

      expect(deleteRequest).toHaveBeenCalledWith('/forum/answers/11/votes', {
        skipGlobalErrorHandler: true,
      });
    });
  });
});
