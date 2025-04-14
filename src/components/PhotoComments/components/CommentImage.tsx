import { IComment } from '..';

const CommentImage = ({ comment }: { comment: IComment }) => {
  return (
    <img
      src={comment.imageUrl}
      alt="comment image"
      className="w-full h-auto rounded-lg max-w-[300px] max-h-[300px] object-cover"
    />
  );
};

export default CommentImage;
