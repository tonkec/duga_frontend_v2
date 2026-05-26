export interface ForumUser {
  id: number;
  publicId?: string;
  name?: string;
  username?: string;
  picture?: string;
  avatar?: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export type VoteValue = 1 | -1;

export interface VotePayload {
  value: VoteValue;
}

export interface ReactionPayload {
  emoji: string;
}

export interface VoteMetadata {
  voteScore?: number;
  voteCount?: number;
  score?: number;
  votes?: number;
  upvotes?: number;
  downvotes?: number;
  userVote?: VoteValue | null;
  currentUserVote?: VoteValue | null;
  myVote?: VoteValue | null;
}

export interface AnswerReaction {
  emoji: string;
  count: number;
  reactedByCurrentUser?: boolean;
  currentUserReacted?: boolean;
  currentUserHasReacted?: boolean;
  hasReacted?: boolean;
  isMine?: boolean;
  userId?: number;
  userIds?: number[];
  users?: ForumUser[];
}

export interface AnswerReply {
  id: number;
  answerId: number;
  userId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  User?: ForumUser;
  user?: ForumUser;
  reactions?: AnswerReaction[];
  Reactions?: AnswerReaction[];
  reactionCount?: number;
  currentUserReactions?: string[];
  myReactions?: string[];
  userReactions?: string[];
}

export interface Answer extends VoteMetadata {
  id: number;
  questionId: number;
  userId: number;
  body: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  securePhotoUrl?: string | null;
  securePhotoUrls?: string[] | null;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  User?: ForumUser;
  user?: ForumUser;
  taggedUsers?: ForumUser[];
  reactions?: AnswerReaction[];
  Reactions?: AnswerReaction[];
  reactionCount?: number;
  currentUserReactions?: string[];
  myReactions?: string[];
  userReactions?: string[];
  replies?: AnswerReply[];
  Replies?: AnswerReply[];
}

export interface Question extends VoteMetadata {
  id: number;
  userId: number;
  title: string;
  body: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  securePhotoUrl?: string | null;
  securePhotoUrls?: string[] | null;
  categoryId?: number | null;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  User?: ForumUser;
  user?: ForumUser;
  taggedUsers?: ForumUser[];
  Category?: Category;
  category?: Category | null;
  Answers?: Answer[];
  answers?: Answer[];
  answerCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface GetQuestionsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export interface CreateQuestionPayload {
  title: string;
  body: string;
  categoryId?: number | null;
  image?: File | null;
  images?: File[];
  taggedUserIds?: number[];
}

export interface CreateAnswerPayload {
  body: string;
  image?: File | null;
  images?: File[];
  taggedUserIds?: number[];
}

export interface AnswerReplyPayload {
  body: string;
}

export type UpdateQuestionPayload = Partial<CreateQuestionPayload> & {
  removeImage?: boolean;
};

export type UpdateAnswerPayload = Partial<CreateAnswerPayload> & {
  removeImage?: boolean;
};
