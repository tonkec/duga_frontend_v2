import { IComment } from '..';
import CommentImage from './CommentImage';
import CommentWithMention from './CommentWithMention';

const CommentContent = ({ comment }: { comment: IComment }) => {
  if (comment.imageUrl) {
    return <CommentImage comment={comment} />;
  }

  if (comment.comment) {
    return <CommentWithMention comment={comment} />;
  }

  return null;
};

export default CommentContent;
