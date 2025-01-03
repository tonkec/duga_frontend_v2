import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';
import { useAddUploadComment, useGetUploadComments } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams } from 'react-router';
import CommentWithUser from './components/CommentWithUser';

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
}

const PhotoComments = () => {
  const { mutateAddUploadComment } = useAddUploadComment();
  const [userId] = useLocalStorage('userId');
  const { photoId } = useParams();
  const { allComments } = useGetUploadComments(photoId as string);

  const {
    register,
    handleSubmit,
    formState: { isValid },
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
  };

  return (
    <>
      {' '}
      <div className="flex flex-col gap-2 ">
        <div>
          {allComments?.data.map((comment: IComment) => (
            <div key={comment.id} className="bg-gray-100 p-2 rounded mb-2">
              <CommentWithUser comment={comment} />
            </div>
          ))}
        </div>
      </div>
      <form
        className="flex w-full justify-between gap-2 items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input type="text" placeholder="Dodaj komentar" {...register('comment')} />
        <Button type="primary">Komentiraj</Button>
      </form>
    </>
  );
};

export default PhotoComments;
