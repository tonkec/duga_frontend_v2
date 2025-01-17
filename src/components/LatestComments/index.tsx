import { useNavigate } from 'react-router';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../Card';
import Loader from '../Loader';
import RecordCreatedAt from '../RecordCreatedAt';
import { useGetLatestComments } from './hooks';
import Avatar from 'react-avatar';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';
import { useGetAllImages } from '../../hooks/useGetAllImages';

interface IComment {
  id: number;
  comment: string;
  createdAt: string;
  uploadId: number;
  userId: number;
}

export const LatestComment = ({ comment, onClick }: { comment: IComment; onClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(comment.userId.toString());
  const { allImages } = useGetAllImages(comment.userId.toString());
  return (
    <div
      className="flex flex-col gap-1 border-b p-4 hover:bg-blue-dark hover:text-white transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          color="#2D46B9"
          name={`${user?.data.firstName} ${user?.data.lastName}`}
          src={getProfilePhotoUrl(getProfilePhoto(allImages?.data.images))}
          size="40"
          round={true}
          onClick={() => {
            navigate(`/user/${comment.userId}`);
          }}
          className="cursor-pointer"
        />
        <p className="text-sm">{comment.comment || 'Nema komentara'}</p>
      </div>
      <div className="flex justify-between">
        <RecordCreatedAt createdAt={comment.createdAt} />
      </div>
    </div>
  );
};

const LatestComments = () => {
  const navigate = useNavigate();
  const numberOfComments = 3;
  const { allComments, isAllCommentsLoading } = useGetLatestComments();
  if (isAllCommentsLoading) {
    return <Loader />;
  }

  if (!allComments?.data.length) {
    return null;
  }

  const comments = allComments?.data.slice(0, numberOfComments) || [];
  return (
    <div className="col-span-2">
      <h2 className="mb-2">💬 Zadnji komentari na fotografije</h2>
      <Card className="!p-0 overflow-hidden">
        {comments.map((comment: IComment) => (
          <LatestComment
            key={comment.id}
            comment={comment}
            onClick={() => navigate(`/photo/${comment.uploadId}`)}
          />
        ))}
      </Card>
    </div>
  );
};

export default LatestComments;
