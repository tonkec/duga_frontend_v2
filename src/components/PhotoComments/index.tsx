import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';
import { useAddUploadComment, useGetUploadComments } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams } from 'react-router';
import CommentWithUser from './components/CommentWithUser';
import FieldError from '../FieldError';
import { socket } from '../../socket';
import { useEffect, useState } from 'react';
import Paginated from '../Paginated';

const schema = z.object({
  comment: z.string().nonempty('Komentar je obavezan.'),
});

interface Inputs {
  comment: string;
}

export interface IComment {
  id: string;
  comment: string;
  userId: string;
  uploadId: string;
  createdAt: string;
}

const PhotoComments = () => {
  const { mutateAddUploadComment } = useAddUploadComment();
  const [userId] = useLocalStorage('userId');
  const { photoId } = useParams();
  const { allComments: allCommentsData, areCommentsLoading } = useGetUploadComments(
    photoId as string
  );
  const [allComments, setAllComments] = useState<IComment[]>([]);

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Inputs) => {
    if (!isValid || !userId || !photoId) {
      return;
    }

    const dataToSubmit = {
      userId: userId as string,
      uploadId: photoId,
      comment: data.comment,
    };
    mutateAddUploadComment(dataToSubmit);
    reset();
  };

  useEffect(() => {
    if (!areCommentsLoading) {
      setAllComments(allCommentsData?.data as IComment[]);
    }
    socket.on('receive-comment', (data) => {
      setAllComments((prev) => [...prev, data.data]);
    });

    return () => {
      socket.off('receive-comment');
    };
  }, [areCommentsLoading, allCommentsData]);

  const sortedComments = allComments?.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <>
      <div className="flex flex-col gap-2 ">
        <div>
          <Paginated<IComment>
            gridClassName="grid grid-cols-1 gap-2"
            data={sortedComments}
            paginatedSingle={({ singleEntry }: { singleEntry: IComment }) => (
              <CommentWithUser comment={singleEntry} />
            )}
          />
        </div>
      </div>

      <form
        className="flex w-full justify-between gap-2 items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input type="text" placeholder="Dodaj komentar" {...register('comment')} />
        <Button type="primary">Komentiraj</Button>
      </form>
      {errors.comment && <FieldError message={errors.comment.message || ''} />}
    </>
  );
};

export default PhotoComments;
