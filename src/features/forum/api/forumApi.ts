import { apiClient } from '@app/api';
import type {
  Answer,
  CreateAnswerPayload,
  CreateQuestionPayload,
  GetQuestionsParams,
  PaginatedResponse,
  Question,
  UpdateAnswerPayload,
  UpdateQuestionPayload,
  VotePayload,
} from '../types/forum.types';

type QuestionsResponse = PaginatedResponse<Question> | Question[];
type WrappedResponse<T> = {
  data: T;
};
type SingleResponse<T> = T | WrappedResponse<T>;

const isWrappedResponse = <T,>(response: SingleResponse<T>): response is WrappedResponse<T> => {
  return typeof response === 'object' && response !== null && 'data' in response;
};

const unwrapResponse = <T,>(response: SingleResponse<T>): T => {
  if (isWrappedResponse(response)) {
    return response.data;
  }

  return response;
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const normalizeUser = (user: Question['User'] | Question['user']) => {
  if (!user) return undefined;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return {
    ...user,
    name: user.name || fullName || user.username,
    picture: user.picture || user.avatar,
  };
};

const normalizeAnswer = (answer: Answer): Answer => {
  const user = normalizeUser(answer.User || answer.user);

  return {
    ...answer,
    userId: toOptionalNumber(answer.userId) ?? user?.id ?? answer.userId,
    voteScore: toOptionalNumber(answer.voteScore),
    voteCount: toOptionalNumber(answer.voteCount),
    User: user,
  };
};

const normalizeQuestion = (question: Question): Question => {
  const answers = question.Answers || question.answers || [];
  const answerCount = toOptionalNumber(question.answerCount);
  const user = normalizeUser(question.User || question.user);

  return {
    ...question,
    userId: toOptionalNumber(question.userId) ?? user?.id ?? question.userId,
    voteScore: toOptionalNumber(question.voteScore),
    voteCount: toOptionalNumber(question.voteCount),
    User: user,
    Category: question.Category || question.category || undefined,
    Answers: answers.map(normalizeAnswer),
    answerCount: Math.max(answerCount ?? 0, answers.length),
  };
};

const createQuestionFormData = (payload: CreateQuestionPayload | UpdateQuestionPayload) => {
  const formData = new FormData();

  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.body !== undefined) formData.append('body', payload.body);
  if (payload.categoryId !== undefined && payload.categoryId !== null) {
    formData.append('categoryId', String(payload.categoryId));
  }
  if (payload.image) formData.append('questionImage', payload.image);
  payload.images?.forEach((image) => formData.append('questionImage', image));
  if ('removeImage' in payload && payload.removeImage) formData.append('removeImage', 'true');

  return formData;
};

const createAnswerFormData = (payload: CreateAnswerPayload | UpdateAnswerPayload) => {
  const formData = new FormData();

  if (payload.body !== undefined) formData.append('body', payload.body);
  if (payload.image) formData.append('answerImage', payload.image);
  payload.images?.forEach((image) => formData.append('answerImage', image));
  if ('removeImage' in payload && payload.removeImage) formData.append('removeImage', 'true');

  return formData;
};

const normalizeQuestionsResponse = (
  response: QuestionsResponse,
  params?: GetQuestionsParams
): PaginatedResponse<Question> => {
  if (!Array.isArray(response)) {
    return {
      ...response,
      data: response.data.map(normalizeQuestion),
    };
  }

  return {
    data: response.map(normalizeQuestion),
    total: response.length,
    page: params?.page ?? 1,
    limit: params?.limit ?? response.length,
    totalPages: 1,
  };
};

export const getQuestions = async (
  params?: GetQuestionsParams
): Promise<PaginatedResponse<Question>> => {
  const client = apiClient();
  const response = await client.get<QuestionsResponse>('/forum/questions', {
    params,
    skipGlobalErrorHandler: true,
  });

  return normalizeQuestionsResponse(response.data, params);
};

export const getQuestion = async (id: number | string): Promise<Question> => {
  const client = apiClient();
  const response = await client.get<SingleResponse<Question>>(`/forum/questions/${id}`, {
    skipGlobalErrorHandler: true,
  });

  return normalizeQuestion(unwrapResponse(response.data));
};

export const createQuestion = async (payload: CreateQuestionPayload): Promise<Question> => {
  const client = apiClient();
  const response = await client.post<SingleResponse<Question>>(
    '/forum/questions',
    createQuestionFormData(payload),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipGlobalErrorHandler: true,
    }
  );

  return normalizeQuestion(unwrapResponse(response.data));
};

export const updateQuestion = async (
  id: number,
  payload: UpdateQuestionPayload
): Promise<Question> => {
  const client = apiClient();
  const response = await client.patch<SingleResponse<Question>>(
    `/forum/questions/${id}`,
    createQuestionFormData(payload),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipGlobalErrorHandler: true,
    }
  );

  return normalizeQuestion(unwrapResponse(response.data));
};

export const deleteQuestion = async (id: number): Promise<void> => {
  const client = apiClient();
  await client.delete(`/forum/questions/${id}`, {
    skipGlobalErrorHandler: true,
  });
};

export const createAnswer = async (
  questionId: number,
  payload: CreateAnswerPayload
): Promise<Answer> => {
  const client = apiClient();
  const response = await client.post<SingleResponse<Answer>>(
    `/forum/questions/${questionId}/answers`,
    createAnswerFormData(payload),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipGlobalErrorHandler: true,
    }
  );

  return normalizeAnswer(unwrapResponse(response.data));
};

export const updateAnswer = async (id: number, payload: UpdateAnswerPayload): Promise<Answer> => {
  const client = apiClient();
  const response = await client.patch<SingleResponse<Answer>>(
    `/forum/answers/${id}`,
    createAnswerFormData(payload),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipGlobalErrorHandler: true,
    }
  );

  return normalizeAnswer(unwrapResponse(response.data));
};

export const deleteAnswer = async (id: number): Promise<void> => {
  const client = apiClient();
  await client.delete(`/forum/answers/${id}`, {
    skipGlobalErrorHandler: true,
  });
};

export const acceptAnswer = async (questionId: number, answerId: number): Promise<Question> => {
  const client = apiClient();
  const response = await client.patch<SingleResponse<Question>>(
    `/forum/questions/${questionId}/answers/${answerId}/accept`,
    undefined,
    { skipGlobalErrorHandler: true }
  );

  return normalizeQuestion(unwrapResponse(response.data));
};

export const voteQuestion = async (id: number, payload: VotePayload): Promise<Question> => {
  const client = apiClient();
  const response = await client.post<SingleResponse<Question>>(`/forum/questions/${id}/votes`, payload, {
    skipGlobalErrorHandler: true,
  });

  return normalizeQuestion(unwrapResponse(response.data));
};

export const deleteQuestionVote = async (id: number): Promise<void> => {
  const client = apiClient();
  await client.delete(`/forum/questions/${id}/votes`, {
    skipGlobalErrorHandler: true,
  });
};

export const voteAnswer = async (id: number, payload: VotePayload): Promise<Answer> => {
  const client = apiClient();
  const response = await client.post<SingleResponse<Answer>>(`/forum/answers/${id}/votes`, payload, {
    skipGlobalErrorHandler: true,
  });

  return normalizeAnswer(unwrapResponse(response.data));
};

export const deleteAnswerVote = async (id: number): Promise<void> => {
  const client = apiClient();
  await client.delete(`/forum/answers/${id}/votes`, {
    skipGlobalErrorHandler: true,
  });
};
