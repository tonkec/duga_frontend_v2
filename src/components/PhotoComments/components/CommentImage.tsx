import { IComment } from '..';

const CommentImage = ({ comment }: { comment: IComment }) => {
  return (
    <>
      <img
        src={comment.imageUrl}
        alt="Slika komentara"
        className="w-full h-auto rounded-lg max-w-[300px] max-h-[300px] object-cover"
      />
      {comment?.comment && <p>{comment?.comment}</p>}
    </>
  );
};

export default CommentImage;
