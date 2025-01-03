import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';
import { useAddUploadComment } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams } from 'react-router';

const schema = z.object({
  comment: z.string().nonempty('Komentar je obavezan.'),
});

interface Inputs {
  comment: string;
}
const PhotoComments = () => {
  const { mutateAddUploadComment } = useAddUploadComment();
  const [userId] = useLocalStorage('userId');
  const { photoId } = useParams();

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
    <div className="flex flex-col gap-2 ">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input type="text" placeholder="Unesite komentar" {...register('comment')} />
        <Button type="primary" className="mt-2 ">
          Komentiraj
        </Button>
      </form>
    </div>
  );
};

export default PhotoComments;
