import { useEffect } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@app/context/useSocket';
import {
  acceptAnswer,
  addAnswerReaction,
  addAnswerReplyReaction,
  createAnswerReply,
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteAnswerImage,
  deleteAnswerReply,
  deleteAnswerReaction,
  deleteAnswerReplyReaction,
  deleteAnswerVote,
  deleteQuestion,
  deleteQuestionImage,
  deleteQuestionVote,
  getQuestion,
  getQuestions,
  updateAnswerReply,
  updateAnswer,
  updateQuestion,
  voteAnswer,
  voteQuestion,
} from '../api/forumApi';
import type {
  Answer,
  AnswerReply,
  AnswerReplyPayload,
  CreateAnswerPayload,
  CreateQuestionPayload,
  ForumUser,
  GetQuestionsParams,
  Question,
  ReactionPayload,
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
  'forum-answer-reply-created',
  'forum-answer-reply-updated',
  'forum-answer-reply-deleted',
  'forum-answer-reaction-updated',
  'forum-answer-reply-reaction-updated',
  'forum-question-vote-updated',
  'forum-answer-vote-updated',
] as const;

const FORUM_QUESTION_LIST_SOCKET_EVENTS = [
  'forum-question-created',
  'forum-question-updated',
  'forum-question-deleted',
  'forum-answer-reply-created',
  'forum-answer-reply-updated',
  'forum-answer-reply-deleted',
] as const;

type ForumSocketEvent = (typeof FORUM_SOCKET_EVENTS)[number];

type ForumSocketEnvelope = {
  data?: unknown;
  answerId?: number | string;
  questionId?: number | string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const isAnswerReplyCrudEvent = (event: ForumSocketEvent) =>
  event === 'forum-answer-reply-created' ||
  event === 'forum-answer-reply-updated' ||
  event === 'forum-answer-reply-deleted';

const getEnvelopeQuestionId = (payload: ForumSocketEnvelope) => {
  const payloadQuestionId = toNumber(payload.questionId);
  if (payloadQuestionId) return payloadQuestionId;

  if (isRecord(payload.data)) {
    return toNumber(payload.data.questionId);
  }

  return undefined;
};

const getQuestionIdFromPayload = (payload: ForumSocketEnvelope) => {
  return (
    getEnvelopeQuestionId(payload) ??
    (isRecord(payload.data) ? toNumber(payload.data.id) : undefined)
  );
};

const getDetailEventQuestionId = (event: ForumSocketEvent, payload: ForumSocketEnvelope) => {
  if (
    event === 'forum-question-created' ||
    event === 'forum-question-updated' ||
    event === 'forum-question-deleted'
  ) {
    return getQuestionIdFromPayload(payload);
  }

  return getEnvelopeQuestionId(payload);
};

const getAnswerIdFromPayload = (payload: ForumSocketEnvelope) => {
  if (!isRecord(payload.data)) return undefined;
  return toNumber(payload.data.id) ?? toNumber(payload.data.answerId);
};

const getQuestionFromPayload = (payload: ForumSocketEnvelope): Question | null => {
  if (!isRecord(payload.data) || !toNumber(payload.data.id)) {
    return null;
  }

  return payload.data as unknown as Question;
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
    answerCount:
      typeof question.answerCount === 'number'
        ? Math.max(0, question.answerCount - 1)
        : nextAnswers.length,
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
    return isRecord(payload.data)
      ? { ...question, ...(payload.data as Partial<Question>) }
      : question;
  }

  return {
    ...question,
    isResolved: isAccepted,
    Answers: question.Answers?.map((answer) => ({
      ...answer,
      ...(answer.id === acceptedAnswerId && isRecord(payload.data)
        ? (payload.data as Partial<Answer>)
        : {}),
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
      answer.id === answerId
        ? applyVoteMetadata(answer, payload.data as Record<string, unknown>)
        : answer
    ),
  };
};

const getReactionEmojiFromPayload = (payload: ForumSocketEnvelope) => {
  if (!isRecord(payload.data)) return undefined;
  return typeof payload.data.emoji === 'string' ? payload.data.emoji : undefined;
};

const getAnswerReactionsFromPayload = (
  payload: ForumSocketEnvelope,
  cachedAnswer: Answer
): Answer['reactions'] => {
  if (!isRecord(payload.data) || !Array.isArray(payload.data.reactions)) return undefined;

  return payload.data.reactions
    .filter((reaction): reaction is Record<string, unknown> => isRecord(reaction))
    .map((reaction) => {
      const emoji = typeof reaction.emoji === 'string' ? reaction.emoji : '';
      const count = toNumber(reaction.count) ?? 0;
      const existingReaction = cachedAnswer.reactions?.find(
        (currentReaction) => currentReaction.emoji === emoji
      );

      return {
        emoji,
        count,
        reactedByCurrentUser: existingReaction?.reactedByCurrentUser,
      };
    })
    .filter((reaction) => reaction.emoji && reaction.count > 0);
};

const updateCachedAnswerReactionFromSocket = (
  question: Question | undefined,
  payload: ForumSocketEnvelope
): Question | undefined => {
  if (!question?.Answers || !isRecord(payload.data)) return question;

  const answer = getAnswerFromPayload(payload);
  if (answer) return mergeCachedAnswer(question, answer);

  const answerId = getAnswerIdFromPayload(payload);
  if (!answerId) return question;

  return {
    ...question,
    Answers: question.Answers.map((cachedAnswer) => {
      if (cachedAnswer.id !== answerId) return cachedAnswer;

      const reactionData = payload.data as Record<string, unknown>;
      const reactionsFromPayload = getAnswerReactionsFromPayload(payload, cachedAnswer);
      const reactionCount = toNumber(reactionData.reactionCount);

      if (reactionsFromPayload) {
        return {
          ...cachedAnswer,
          reactions: reactionsFromPayload,
          reactionCount,
        };
      }

      const emoji = getReactionEmojiFromPayload(payload);
      if (!emoji) return cachedAnswer;

      const reactions = cachedAnswer.reactions ?? [];
      const nextCount = toNumber(reactionData.count) ?? toNumber(reactionData.reactionCount);
      const reactedByCurrentUser =
        typeof reactionData.reactedByCurrentUser === 'boolean'
          ? reactionData.reactedByCurrentUser
          : undefined;
      const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);
      const nextReaction = {
        emoji,
        count: nextCount ?? existingReaction?.count ?? 0,
        reactedByCurrentUser: reactedByCurrentUser ?? existingReaction?.reactedByCurrentUser,
      };
      const nextReactions = reactions.some((reaction) => reaction.emoji === emoji)
        ? reactions.map((reaction) => (reaction.emoji === emoji ? nextReaction : reaction))
        : [...reactions, nextReaction];

      return {
        ...cachedAnswer,
        reactions: nextReactions.filter((reaction) => reaction.count > 0),
      };
    }),
  };
};

const getAnswerReplyIdFromPayload = (payload: ForumSocketEnvelope) => {
  if (!isRecord(payload.data)) return undefined;
  return (
    toNumber(payload.data.answerReplyId) ??
    toNumber(payload.data.replyId) ??
    toNumber(payload.data.id)
  );
};

const getAnswerReplyFromPayload = (payload: ForumSocketEnvelope): AnswerReply | null => {
  if (!isRecord(payload.data) || !toNumber(payload.data.id)) {
    return null;
  }

  return payload.data as unknown as AnswerReply;
};

const getAnswerIdForReplyPayload = (payload: ForumSocketEnvelope) => {
  if (!isRecord(payload.data)) return toNumber(payload.answerId);
  return toNumber(payload.data.answerId) ?? toNumber(payload.answerId);
};

const getAnswerReplyReactionsFromPayload = (
  payload: ForumSocketEnvelope
): AnswerReply['reactions'] => {
  if (!isRecord(payload.data) || !Array.isArray(payload.data.reactions)) return undefined;

  const userReactions = Array.isArray(payload.data.userReactions)
    ? payload.data.userReactions.filter((emoji): emoji is string => typeof emoji === 'string')
    : [];

  return payload.data.reactions
    .filter((reaction): reaction is Record<string, unknown> => isRecord(reaction))
    .map((reaction) => {
      const emoji = typeof reaction.emoji === 'string' ? reaction.emoji : '';
      const count = toNumber(reaction.count) ?? 0;

      return {
        emoji,
        count,
        reactedByCurrentUser: userReactions.includes(emoji),
      };
    })
    .filter((reaction) => reaction.emoji && reaction.count > 0);
};

const updateCachedAnswerReplyReactionFromSocket = (
  question: Question | undefined,
  payload: ForumSocketEnvelope
): Question | undefined => {
  if (!question?.Answers || !isRecord(payload.data)) return question;

  const answerId = toNumber(payload.data.answerId) ?? toNumber(payload.answerId);
  const replyId = getAnswerReplyIdFromPayload(payload);
  if (!replyId) return question;

  const reactions = getAnswerReplyReactionsFromPayload(payload);
  const reactionCount = toNumber(payload.data.reactionCount);
  const userReactions = Array.isArray(payload.data.userReactions)
    ? payload.data.userReactions.filter((emoji): emoji is string => typeof emoji === 'string')
    : undefined;

  return {
    ...question,
    Answers: question.Answers.map((answer) => {
      if (answerId && answer.id !== answerId) return answer;

      return {
        ...answer,
        replies: answer.replies?.map((reply) =>
          reply.id === replyId
            ? {
                ...reply,
                reactions: reactions ?? reply.reactions,
                reactionCount: reactionCount ?? reply.reactionCount,
                userReactions: userReactions ?? reply.userReactions,
              }
            : reply
        ),
      };
    }),
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
    case 'forum-answer-reply-created': {
      const reply = getAnswerReplyFromPayload(payload);
      const answerId = getAnswerIdForReplyPayload(payload);
      return reply && answerId ? addCachedAnswerReply(question, answerId, reply) : question;
    }
    case 'forum-answer-reply-updated': {
      const reply = getAnswerReplyFromPayload(payload);
      return reply ? updateCachedAnswerReply(question, reply.id, reply) : question;
    }
    case 'forum-answer-reply-deleted': {
      const replyId = getAnswerReplyIdFromPayload(payload);
      return replyId ? removeCachedAnswerReply(question, replyId) : question;
    }
    case 'forum-answer-accepted':
      return applyAcceptedAnswer(question, payload);
    case 'forum-answer-reaction-updated':
      return updateCachedAnswerReactionFromSocket(question, payload);
    case 'forum-answer-reply-reaction-updated':
      return updateCachedAnswerReplyReactionFromSocket(question, payload);
    case 'forum-question-vote-updated':
      return updateCachedQuestionVote(question, payload);
    case 'forum-answer-vote-updated':
      return updateCachedAnswerVoteFromSocket(question, payload);
    case 'forum-question-created': {
      const nextQuestion = getQuestionFromPayload(payload);
      return nextQuestion ?? question;
    }
    case 'forum-question-updated':
      return isRecord(payload.data)
        ? ({ ...(question ?? {}), ...(payload.data as Partial<Question>) } as Question)
        : question;
    case 'forum-question-deleted':
      return undefined;
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
      const eventQuestionId = getDetailEventQuestionId(event, payload);
      if (!questionId || (eventQuestionId && eventQuestionId !== questionId)) return;
      if (!eventQuestionId && !isAnswerReplyCrudEvent(event)) return;

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
      ? Math.max(
          0,
          item.upvotes + (nextVoteValue === 1 ? 1 : 0) - (previousVoteValue === 1 ? 1 : 0)
        )
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

const updateCachedAnswerReaction = (
  question: Question | undefined,
  answerId: number,
  emoji: string,
  reactedByCurrentUser: boolean
) => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((answer) => {
      if (answer.id !== answerId) return answer;

      const reactions = answer.reactions ?? [];
      const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);
      const nextCount = reactedByCurrentUser
        ? (existingReaction?.count ?? 0) + (existingReaction?.reactedByCurrentUser ? 0 : 1)
        : Math.max(
            0,
            (existingReaction?.count ?? 0) - (existingReaction?.reactedByCurrentUser ? 1 : 0)
          );
      const nextReaction = {
        emoji,
        count: nextCount,
        reactedByCurrentUser,
      };
      const nextReactions = existingReaction
        ? reactions.map((reaction) => (reaction.emoji === emoji ? nextReaction : reaction))
        : [...reactions, nextReaction];

      return {
        ...answer,
        reactions: nextReactions.filter((reaction) => reaction.count > 0),
      };
    }),
  };
};

const updateCachedAnswerReplyReaction = (
  question: Question | undefined,
  replyId: number,
  emoji: string,
  reactedByCurrentUser: boolean
) => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((answer) => ({
      ...answer,
      replies: answer.replies?.map((reply) => {
        if (reply.id !== replyId) return reply;

        const reactions = reply.reactions ?? [];
        const currentUserReactions = [
          ...(reply.currentUserReactions ?? []),
          ...(reply.myReactions ?? []),
          ...(reply.userReactions ?? []),
        ];
        const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);
        const hasReacted =
          existingReaction?.reactedByCurrentUser || currentUserReactions.includes(emoji);
        const nextCount = reactedByCurrentUser
          ? (existingReaction?.count ?? 0) + (hasReacted ? 0 : 1)
          : Math.max(0, (existingReaction?.count ?? 0) - (hasReacted ? 1 : 0));
        const nextReaction = {
          emoji,
          count: nextCount,
          reactedByCurrentUser,
        };
        const nextReactions = existingReaction
          ? reactions.map((reaction) => (reaction.emoji === emoji ? nextReaction : reaction))
          : [...reactions, nextReaction];
        const nextUserReactions = reactedByCurrentUser
          ? Array.from(new Set([...currentUserReactions, emoji]))
          : currentUserReactions.filter((reactionEmoji) => reactionEmoji !== emoji);

        return {
          ...reply,
          reactions: nextReactions.filter((reaction) => reaction.count > 0),
          reactionCount: nextReactions.reduce(
            (sum, reaction) => sum + Math.max(0, reaction.count),
            0
          ),
          userReactions: nextUserReactions,
        };
      }),
    })),
  };
};

const addCachedAnswerReply = (
  question: Question | undefined,
  answerId: number,
  reply: AnswerReply
): Question | undefined => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((answer) => {
      if (answer.id !== answerId) return answer;
      const replies = answer.replies ?? [];
      const nextReplies = replies.some((cachedReply) => cachedReply.id === reply.id)
        ? replies.map((cachedReply) => (cachedReply.id === reply.id ? reply : cachedReply))
        : [...replies, reply];

      return {
        ...answer,
        replies: nextReplies,
      };
    }),
  };
};

const updateCachedAnswerReply = (
  question: Question | undefined,
  replyId: number,
  payload: Partial<AnswerReply>
): Question | undefined => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((answer) => ({
      ...answer,
      replies: answer.replies?.map((reply) =>
        reply.id === replyId ? { ...reply, ...payload } : reply
      ),
    })),
  };
};

const removeCachedAnswerReply = (
  question: Question | undefined,
  replyId: number
): Question | undefined => {
  if (!question?.Answers) return question;

  return {
    ...question,
    Answers: question.Answers.map((answer) => ({
      ...answer,
      replies: answer.replies?.filter((reply) => reply.id !== replyId),
    })),
  };
};

const addCachedAnswer = (question: Question | undefined, answer: Answer): Question | undefined => {
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

export const useDeleteQuestionImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteQuestionImage(id),
    onSuccess: (_response, questionId) => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.question(questionId) });
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

export const useDeleteAnswerImage = (questionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: number) => deleteAnswerImage(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.question(questionId) });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
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

export const useAddAnswerReaction = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: ({ answerId, payload }: { answerId: number; payload: ReactionPayload }) =>
      addAnswerReaction(answerId, payload),
    onMutate: async ({ answerId, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        updateCachedAnswerReaction(currentQuestion, answerId, payload.emoji, true)
      );

      return { previousQuestion };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSuccess: (answer) => {
      if (answer) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          mergeCachedAnswer(currentQuestion, answer)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useDeleteAnswerReaction = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: ({ answerId, payload }: { answerId: number; payload: ReactionPayload }) =>
      deleteAnswerReaction(answerId, payload),
    onMutate: async ({ answerId, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        updateCachedAnswerReaction(currentQuestion, answerId, payload.emoji, false)
      );

      return { previousQuestion };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSuccess: (answer) => {
      if (answer) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          mergeCachedAnswer(currentQuestion, answer)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useAddAnswerReplyReaction = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: ({ replyId, payload }: { replyId: number; payload: ReactionPayload }) =>
      addAnswerReplyReaction(replyId, payload),
    onMutate: async ({ replyId, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        updateCachedAnswerReplyReaction(currentQuestion, replyId, payload.emoji, true)
      );

      return { previousQuestion };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSuccess: (reply) => {
      if (reply) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          updateCachedAnswerReply(currentQuestion, reply.id, reply)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useDeleteAnswerReplyReaction = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: ({ replyId, payload }: { replyId: number; payload: ReactionPayload }) =>
      deleteAnswerReplyReaction(replyId, payload),
    onMutate: async ({ replyId, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        updateCachedAnswerReplyReaction(currentQuestion, replyId, payload.emoji, false)
      );

      return { previousQuestion };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSuccess: (reply) => {
      if (reply) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          updateCachedAnswerReply(currentQuestion, reply.id, reply)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};

export const useCreateAnswerReply = (questionId: number, currentUser?: ForumUser) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: ({ answerId, payload }: { answerId: number; payload: AnswerReplyPayload }) =>
      createAnswerReply(answerId, payload),
    onMutate: async ({ answerId, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);
      const tempReplyId = -Date.now();
      const now = new Date().toISOString();
      const optimisticReply: AnswerReply = {
        id: tempReplyId,
        answerId,
        userId: currentUser?.id ?? 0,
        body: payload.body,
        createdAt: now,
        updatedAt: now,
        User: currentUser,
      };

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        addCachedAnswerReply(currentQuestion, answerId, optimisticReply)
      );

      return { previousQuestion, answerId, tempReplyId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSuccess: (reply, _variables, context) => {
      if (reply && context?.tempReplyId) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          updateCachedAnswerReply(currentQuestion, context.tempReplyId, reply)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      invalidateForumQuestionLists(queryClient);
    },
  });
};

export const useUpdateAnswerReply = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AnswerReplyPayload }) =>
      updateAnswerReply(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        updateCachedAnswerReply(currentQuestion, id, {
          body: payload.body,
          updatedAt: new Date().toISOString(),
        })
      );

      return { previousQuestion };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(questionQueryKey, context.previousQuestion);
      }
    },
    onSuccess: (reply) => {
      if (reply) {
        queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
          updateCachedAnswerReply(currentQuestion, reply.id, reply)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
      invalidateForumQuestionLists(queryClient);
    },
  });
};

export const useDeleteAnswerReply = (questionId: number) => {
  const queryClient = useQueryClient();
  const questionQueryKey = forumQueryKeys.question(questionId);

  return useMutation({
    mutationFn: (replyId: number) => deleteAnswerReply(replyId),
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: questionQueryKey });
      const previousQuestion = queryClient.getQueryData<Question>(questionQueryKey);

      queryClient.setQueryData<Question>(questionQueryKey, (currentQuestion) =>
        removeCachedAnswerReply(currentQuestion, replyId)
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
      invalidateForumQuestionLists(queryClient);
    },
  });
};
