import DOMPurify from 'dompurify';
import { Link } from 'react-router';
import { IComment } from '..';

const CommentWithMention = ({ comment }: { comment: IComment }) => {
  const cleanText = DOMPurify.sanitize(comment.comment, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
  if (!cleanText) return null;
  const parts = cleanText.split(/(@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      const matchedUser = comment.taggedUsers?.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (matchedUser) {
        return (
          <Link to={`/user/${matchedUser.id}`} key={index} className="text-blue underline">
            {part}
          </Link>
        );
      }
    }

    return <span key={index}>{part}</span>;
  });
};

export default CommentWithMention;
