import { useEffect } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@app/context/useSocket';
import {
  acceptAnswer,
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteAnswerVote,
  deleteQuestion,
  deleteQuestionVote,
  getQuestion,
  getQuestions,
  updateAnswer,
  updateQuestion,
  voteAnswer,
  voteQuestion,
} from '../api/forumApi';
import type {
  Answer,
  CreateAnswerPayload,
  CreateQuestionPayload,
  ForumUser,
  GetQuestionsParams,
  Question,
  UpdateAnswerPayload,
  UpdateQuestionPayload,
  VoteMetadata,
  VotePayload,
  VoteValue,
} from '../types/forum.types';

export const forumQueryKeys = {
  all: ['forum'] as const,
  questions: (params?: GetQuestionsParams) => [...forumQueryKeys.all, 'questions', params] as const,
  question: (id: number | string) => [...forumQueryKeys.all, 'question', String(id)] as const,
};

const FORUM_SOCKET_EVENTS = [
  'forum-question-created',
  'forum-question-updated',
  'forum-question-deleted',
  'forum-answer-created',
  'forum-answer-updated',
  'forum-answer-deleted',
  'forum-answer-accepted',
  'forum-question-vote-updated',
  'forum-answer-vote-updated',
] as const;

const FORUM_QUESTION_LIST_SOCKET_EVENTS = [
  'forum-question-created',
  'forum-question-updated',
  'forum-question-deleted',
] as const;

type ForumSocketEvent = (typeof FORUM_SOCKET_EVENTS)[number];

type ForumSocketEnvelope = {
  data?: unknown;
  questionId?: number | string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getEnvelopeQuestionId = (payload: ForumSocketEnvelope) => {
  const payloadQuestionId = toNumber(payload.questionId);
  if (payloadQuestionId) return payloadQuestionId;

  if (isRecord(payload.data)) {
    return toNumber(payload.data.questionId);
  }

  return undefined;
};

const getAnswerIdFromPayload = (payload: ForumSocketEnvelope) => {
  if (!isRecord(payload.data)) return undefined;
  return toNumber(payload.data.id) ?? toNumber(payload.data.answerId);
};

const getAnswerFromPayload = (payload: ForumSocketEnvelope): Answer | null => {
  if (!isRecord(payload.data) || !toNumber(payload.data.id)) {
    return null;
  }

  return payload.data as unknown as Answer;
};

const invalidateForumQuestionLists = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) &&
      query.queryKey[0] === 'forum' &&
      query.queryKey[1] === 'questions',
  });
};

const appendOrReplaceCachedAnswer = (
  question: Question | undefined,
  answer: Answer
): Question | undefined => {
  if (!question) return question;

  const answers = question.Answers ?? [];
  const nextAnswers = answers.some((cachedAnswer) => cachedAnswer.id === answer.id)
    ? answers.map((cachedAnswer) => (cachedAnswer.id === answer.id ? answer : cachedAnswer))
    : [
        ...answers.filter(
          (cachedAnswer) =>
            cachedAnswer.id > 0 ||
            cachedAnswer.body !== answer.body ||
            cachedAnswer.userId !== answer.userId
        ),
        answer,
      ];

  return {
    ...question,
    Answers: nextAnswers,
    answerCount: Math.max(question.answerCount ?? 0, nextAnswers.length),
  };
};

const removeCachedAnswer = (
  question: Question | undefined,
  answerId: number
): Question | undefined => {
  if (!question?.Answers) return question;

  const nextAnswers = question.Answers.filter((answer) => answer.id !== answerId);

  return {
    ...question,
    Answers: nextAnswers,
    answerCount: typeof question.answerCount === 'number' ? Math.max(0, question.answerCount - 1) : nextAnswers.length,
  };
};

const applyAcceptedAnswer = (
  question: Question | undefined,
  payload: ForumSocketEnvelope
): Question | undefined => {
  if (!question) return question;

  const acceptedAnswerId = getAnswerIdFromPayload(payload);
  const isAccepted =
    isRecord(payload.data) && typeof payload.data.isAccepted === 'boolean'
      ? payload.data.isAccepted
      : true;

  if (!acceptedAnswerId) {
    return isRecord(payload.data) ? { ...question, ...(payload.data as Partial<Question>) } : question;
  }

  return {
    ...question,
    isResolved: isAccepted,
    Answers: question.Answers?.map((answer) => ({
      ...answer,
      ...(answer.id === acceptedAnswerId && isRecord(payload.data) ? (payload.data as Partial<Answer>) : {}),
      isAccepted: isAccepted ? answer.id === acceptedAnswerId : false,
    })),
  };
};

const applyVoteMetadata = <T extends VoteMetadata>(item: T, data: Record<string, unknown>): T => {
  return {
    ...item,
    voteScore: toNumber(data.voteScore) ?? item.voteScore,
    voteCount: toNumber(data.voteCount) ?? item.voteCount,
    score: toNumber(data.score) ?? item.score,
    votes: toNumber(data.votes) ?? item.votes,
    upvotes: toNumber(data.upvotes) ?? item.upvotes,
    downvotes: toNumber(data.downvotes) ?? item.downvotes,
    userVote: (toNumber(data.userVote) as VoteValue | undefined) ?? item.userVote,
    currentUserVote:
      (toNumber(data.currentUserVote) as VoteValue | undefined) ?? item.currentUserVote,
    myVote: (toNumber(data.myVote) as VoteValue | undefined) ?? item.myVote,
  };
};

const updateCachedQuestionVote = (
  question: Question | undefined,
  payload: ForumSocketEnvelope
): Question | undefined => {
  if (!question || !isRecord(payload.data)) return question;
  return applyVoteMetadata(question, payload.data);
};

const updateCachedAnswerVoteFromSocket = (
  question: Question | undefined,
  payload: ForumSocketEnvelope
): Question | undefined => {
  if (!question?.Answers || !isRecord(payload.data)) return question;

  const answerId = toNumber(payload.data.answerId) ?? toNumber(payload.data.id);
  if (!answerId) return question;

  return {
    ...question,
    Answers: question.Answers.map((answer) =>
      answer.id === answerId ? applyVoteMetadata(answer, payload.data as Record<string, unknown>) : answer
    ),
  };
};

const updateCachedQuestionFromSocket = (
  question: Question | undefined,
  event: ForumSocketEvent,
  payload: ForumSocketEnvelope
): Question | undefined => {
  switch (event) {
    case 'forum-answer-created': {
      const answer = getAnswerFromPayload(payload);
      return answer ? appendOrReplaceCachedAnswer(question, answer) : question;
    }
    case 'forum-answer-updated': {
      const answer = getAnswerFromPayload(payload);
      return answer ? mergeCachedAnswer(question, answer) : question;
    }
    case 'forum-answer-deleted': {
      const answerId = getAnswerIdFromPayload(payload);
      return answerId ? removeCachedAnswer(question, answerId) : question;
    }
    case 'forum-answer-accepted':
      return applyAcceptedAnswer(question, payload);
    case 'forum-question-vote-updated':
      return updateCachedQuestionVote(question, payload);
    case 'forum-answer-vote-updated':
      return updateCachedAnswerVoteFromSocket(question, payload);
    case 'forum-question-updated':
      return isRecord(payload.data) && question ? { ...question, ...(payload.data as Partial<Question>) } : question;
    default:
      return question;
  }
};

export const useForumSocketEvents = (questionId?: number) => {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleQuestionListEvent = () => {
      invalidateForumQuestionLists(queryClient);
    };

    const handleDetailEvent = (event: ForumSocketEvent) => (payload: ForumSocketEnvelope) => {
      if (!questionId || getEnvelopeQuestionId(payload) !== questionId) return;

      queryClient.setQueryData<Question>(forumQueryKeys.question(questionId), (currentQuestion) =>
        updateCachedQuestionFromSocket(currentQuestion, event, payload)
      );

      invalidateForumQuestionLists(queryClient);
    };

    if (!questionId) {
      FORUM_QUESTION_LIST_SOCKET_EVENTS.forEach((event) => {
        socket.on(event, handleQuestionListEvent);
      });

      return () => {
        FORUM_QUESTION_LIST_SOCKET_EVENTS.forEach((event) => {
          socket.off(event, handleQuestionListEvent);
        });
      };
    }

    const detailHandlers = new Map<ForumSocketEvent, (payload: ForumSocketEnvelope) => void>();
    FORUM_SOCKET_EVENTS.forEach((event) => {
      const handler = handleDetailEvent(event);
      detailHandlers.set(event, handler);
      socket.on(event, handler);
    });

    return () => {
      detailHandlers.forEach((handler, event) => {
        socket.off(event, handler);
      });
    };
  }, [queryClient, questionId, socket]);
};

const getCachedVoteScore = (item: VoteMetadata) => {
  if (typeof item.voteScore === 'number') return item.voteScore;
  if (typeof item.score === 'number') return item.score;
  if (typeof item.votes === 'number') return item.votes;
  if (typeof item.upvotes === 'number' || typeof item.downvotes === 'number') {
    return (item.upvotes ?? 0) - (item.downvotes ?? 0);
  }

  return 0;
};

const getCachedCurrentVote = (item: VoteMetadata): VoteValue | null => {
  return item.currentUserVote ?? item.userVote ?? item.myVote ?? null;
};

const applyCachedVote = <T extends VoteMetadata>(item: T, nextVote: VoteValue | null): T => {
  const previousVote = getCachedCurrentVote(item);
  const previousVoteValue = previousVote ?? 0;
  const nextVoteValue = nextVote ?? 0;
  const scoreDelta = nextVoteValue - previousVoteValue;
  const nextUpvotes =
    typeof item.upvotes === 'number'
      ? Math.max(0, item.upvotes + (nextVoteValue === 1 ? 1 : 0) - (previousVoteValue === 1 ? 1 : 0))
      : item.upvotes;
  const nextDownvotes =
    typeof item.downvotes === 'number'
      ? Math.max(
          0,
          item.downvotes + (nextVoteValue === -1 ? 1 : 0) - (previousVoteValue === -1 ? 1 : 0)
        )
      : item.downvotes;

  return {
    ...item,
    voteScore: getCachedVoteScore(item) + scoreDelta,
    currentUserVote: nextVote,
    userVote: nextVote,
    myVote: nextVote,
    upvotes: nextUpvotes,
    downvotes: nextDownvotes,
  };
};

const updateCachedAnswerVote = (
  question: Question | undefined,
  answerId: number,
  vote: VoteValue | null
) => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((answer) =>
      answer.id === answerId ? applyCachedVote(answer, vote) : answer
    ),
  };
};

const addCachedAnswer = (
  question: Question | undefined,
  answer: Answer
): Question | undefined => {
  if (!question) return question;

  return {
    ...question,
    Answers: [...(question.Answers ?? []), answer],
    answerCount: (question.answerCount ?? question.Answers?.length ?? 0) + 1,
  };
};

const replaceCachedAnswer = (
  question: Question | undefined,
  tempAnswerId: number,
  answer: Answer
): Question | undefined => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((cachedAnswer) =>
      cachedAnswer.id === tempAnswerId ? answer : cachedAnswer
    ),
  };
};

const mergeCachedAnswer = (
  question: Question | undefined,
  answer: Answer
): Question | undefined => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((cachedAnswer) =>
      cachedAnswer.id === answer.id ? { ...cachedAnswer, ...answer } : cachedAnswer
    ),
  };
};

export const useQuestions = (params?: GetQuestionsParams) => {
  return useQuery({
    queryKey: forumQueryKeys.questions(params),
    queryFn: () => getQuestions(params),
  });
};

export const useQuestion = (id: number | string | undefined) => {
  return useQuery({
    queryKey: forumQueryKeys.question(id ?? ''),
    queryFn: () => getQuestion(id ?? ''),
    enabled: !!id,
  });
};

export const useQuestionDetails = (questions: Question[]) => {
  return useQueries({
    queries: questions.map((question) => ({
      queryKey: forumQueryKeys.question(question.id),
      queryFn: () => getQuestion(question.id),
      enabled: question.id !== undefined && question.id !== null,
    })),
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) => createQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useCreateAnswer = (questionId: number, currentUser?: ForumUser) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: (payload: CreateAnswerPayload) => createAnswer(questionId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);
      const tempAnswerId = -Date.now();
      const now = new Date().toISOString();

      const optimisticAnswer: Answer = {
        id: tempAnswerId,
        questionId,
        userId: currentUser?.id ?? 0,
        body: payload.body,
        isAccepted: false,
        createdAt: now,
        updatedAt: now,
        User: currentUser,
      };

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        addCachedAnswer(currentQuestion, optimisticAnswer)
      );

      return { previousQuestion, tempAnswerId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSuccess: (answer, _variables, context) => {
      if (context?.tempAnswerId) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          replaceCachedAnswer(currentQuestion, context.tempAnswerId, answer)
        );
      }
    },
    onSettled: () => {
      invalidateForumQuestionLists(queryClient);
    },
  });
};

export const useAcceptAnswer = (questionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: number) => acceptAnswer(questionId, answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.question(questionId) });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateQuestionPayload }) =>
      updateQuestion(id, payload),
    onSuccess: (question) => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.question(question.id) });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAnswerPayload }) =>
      updateAnswer(id, payload),
    onSuccess: (answer) => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.question(answer.questionId) });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useDeleteAnswer = (questionId?: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = questionId ? forumQueryKeys.question(questionId) : undefined;

  return useMutation({
    mutationFn: (id: number) => deleteAnswer(id),
    onSuccess: (_response, answerId) => {
      if (questionQueryKey) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          removeCachedAnswer(currentQuestion, answerId)
        );
      }
      invalidateForumQuestionLists(queryClient);
    },
  });
};

export const useVoteQuestion = (questionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VotePayload) => voteQuestion(questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.question(questionId) });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useDeleteQuestionVote = (questionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteQuestionVote(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.question(questionId) });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useVoteAnswer = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: ({ answerId, payload }: { answerId: number; payload: VotePayload }) =>
      voteAnswer(answerId, payload),
    onMutate: async ({ answerId, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        updateCachedAnswerVote(currentQuestion, answerId, payload.value)
      );

      return { previousQuestion };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useDeleteAnswerVote = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: (answerId: number) => deleteAnswerVote(answerId),
    onMutate: async (answerId) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        updateCachedAnswerVote(currentQuestion, answerId, null)
      );

      return { previousQuestion };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};
