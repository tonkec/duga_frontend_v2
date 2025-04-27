import { Controller, useForm } from 'react-hook-form';
import Button from '@app/components/Button';
import { useAddUploadComment, useGetUploadComments } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams } from 'react-router';
import CommentWithUser from './components/CommentWithUser';
import FieldError from '@app/components/FieldError';
import { useEffect, useState } from 'react';
import Paginated from '@app/components/Paginated';
import { useSocket } from '@app/context/useSocket';
import MentionInput from '@app/components/MentionInput';
import { IUser } from '@app/components/UserCard';

import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';
import EmojiPicker from '@app/components/EmojiPicker';
import { debounce } from 'lodash';
import { IEmoji } from '@app/pages/ChatPage/components/SendMessage';

const schema = z.object({
  comment: z
    .string()
    .min(1, 'Komentar je obavezan.')
    .refine((val) => val.trim().length > 0, {
      message: 'Komentar je obavezan.',
    }),
});

interface Inputs {
  comment: string;
}

export interface IComment {
  id: number;
  comment: string;
  userId: string;
  uploadId: string;
  createdAt: string;
  taggedUsers?: { id: number; username: string }[];
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
  const [taggedUsers, setTaggedUsers] = useState<IUser[]>([]);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);

  const {
    handleSubmit,
    formState: { isValid, errors },
    reset,
    control,
    setValue,
    getValues,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

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
  }, [areCommentsLoading, allCommentsData, socket]);

  const onSubmit = (data: Inputs) => {
    if (!userId || !photoId || !isValid) return;

    // Init emoji search
    init({ data });

    mutateAddUploadComment({
      userId: String(userId),
      uploadId: photoId,
      comment: data.comment,
      taggedUserIds: taggedUsers.map((user) => Number(user.id)),
    });

    reset();
    setTaggedUsers([]);
  };

  async function search(value: string) {
    const emojis = await SearchIndex.search(value);
    const results = emojis.map((emoji: IEmoji) => emoji.skins[0].native);
    return results;
  }

  const handleSearch = async (value: string) => {
    const emojiRegex = /(?:\s|^):([^\s:]+)/;
    const match = value.match(emojiRegex);

    if (match) {
      const searchTerm = match[1];
      const emojis = await search(searchTerm);
      setCurrentEmojis(emojis);
    } else {
      setCurrentEmojis([]);
    }
  };

  const debouncedSearch = debounce(handleSearch, 300);

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
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <MentionInput
              value={field.value}
              // onChange={field.onChange}
              onChange={(value) => {
                field.onChange(value);
                debouncedSearch(value);
              }}
              onTagUsersChange={setTaggedUsers}
              placeholder="Dodaj komentar"
              className="flex-grow"
            />
          )}
        />
        <EmojiPicker
          emojis={currentEmojis}
          onEmojiSelect={(emoji: string) => {
            const currentValue = getValues('comment');
            const updatedValue = currentValue.replace(/(?:\s|^):([^\s:]+)/, emoji);
            setValue('comment', updatedValue, { shouldValidate: true });
            setCurrentEmojis([]);
          }}
        />
        <Button type="primary">Komentiraj</Button>
      </form>

      {errors.comment && <FieldError message="Komentar je obavezan" />}
    </>
  );
};

export default PhotoComments;
