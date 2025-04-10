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
import { useEffect, useRef, useState } from 'react';
import Paginated from '../Paginated';
import { useSocket } from '../../context/useSocket';
import { BiPaperclip } from 'react-icons/bi';

const schema = z
  .object({
    comment: z.string().nonempty('Komentar je obavezan.'),
    files: z.any().optional(),
  })
  .refine((data) => !data.files || (data.files && data.files.length <= 7), {
    message: 'Maksimalno 7 slika je dozvoljeno.',
  })
  .refine((data) => !data.files || (data.files && data.comment), {
    message: 'Komentar je obavezan kada je slika prisutna.',
  });

interface Inputs {
  comment: string;
  files?: FileList | null;
}

export interface IComment {
  id: number;
  comment: string;
  userId: string;
  uploadId: string;
  createdAt: string;
  photoUrl: string;
}

const PhotoComments = () => {
  const socket = useSocket();
  const { mutateAddUploadComment } = useAddUploadComment();
  const [userId] = useLocalStorage('userId');
  const { photoId } = useParams();
  const { allComments: allCommentsData, areCommentsLoading } = useGetUploadComments(
    photoId as string
  );
  const [allComments, setAllComments] = useState<IComment[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadableImage, setCurrentUploadableImage] = useState<File[] | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
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
      photos: currentUploadableImage || [],
    };

    mutateAddUploadComment(dataToSubmit);
    setCurrentUploadableImage(null);
    setPreviewImages([]);
    reset();
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).slice(0, 7);
      setValue('files', files);
      setCurrentUploadableImage(fileArray);

      const newPreviews: string[] = [];
      fileArray.forEach((file) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          newPreviews.push(fileReader.result as string);
          if (newPreviews.length === fileArray.length) {
            setPreviewImages([...newPreviews]);
          }
        };
        fileReader.readAsDataURL(file);
      });
    }
  };

  useEffect(() => {
    if (!areCommentsLoading) {
      setAllComments(allCommentsData?.data as IComment[]);
    }

    socket.on('receive-comment', (data) => {
      setAllComments((prev) => [...prev, data.data]);
    });

    socket.on('remove-comment', (data) => {
      setAllComments((prev) => {
        const updatedComments = prev.filter(
          (comment) => comment.id !== Number(data.data.commentId)
        );
        return updatedComments;
      });
    });

    socket.on('update-comment', (data) => {
      setAllComments((prev) => {
        const updatedComments = prev.map((comment) => {
          if (Number(comment.id) === Number(data.data.id)) {
            return {
              ...comment,
              comment: data.data.comment,
            };
          }
          return comment;
        });
        return updatedComments;
      });
    });

    return () => {
      socket.off('receive-comment');
      socket.off('delete-comment');
      socket.off('update-comment');
    };
  }, [areCommentsLoading, allCommentsData]);

  const sortedComments = allComments?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="flex flex-col gap-2 ">
        <div>
          <Paginated<IComment>
            itemsPerPage={5}
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
        <input
          name="avatars"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <BiPaperclip
          fontSize={20}
          style={{
            transform: 'rotate(90deg)',
          }}
          className="cursor-pointer"
          onClick={handleIconClick}
        />
      </form>

      {previewImages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {previewImages.map((preview, index) => (
            <img
              key={index}
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-[100px] h-[100px] object-cover rounded-md"
            />
          ))}
        </div>
      )}
      {errors.comment && <FieldError message={errors.comment.message || ''} />}
    </>
  );
};

export default PhotoComments;
