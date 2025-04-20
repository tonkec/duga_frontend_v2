import Button from '../../Button';
import { IUser } from '../../UserCard';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MentionInput from '../../MentionInput';
import FieldError from '../../FieldError';
import { useState } from 'react';

const schema = z.object({ comment: z.string().min(1) });

interface Props {
  defaultValue: string;
  defaultImageUrl?: string;
  onCancel: () => void;
  onSubmitForm: (comment: string, taggedUsers: IUser[]) => void;
}

const CommentEditForm = ({ defaultValue, defaultImageUrl, onCancel, onSubmitForm }: Props) => {
  const [taggedUsers, setTaggedUsers] = useState<IUser[]>([]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { comment: defaultValue ?? '' },
  });

  const onSubmit = (data: { comment: string }) => {
    if (!data.comment) return;
    onSubmitForm(data.comment.trim(), taggedUsers);
  };

  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col w-full">
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <MentionInput
              value={field.value}
              onChange={field.onChange}
              onTagUsersChange={setTaggedUsers}
              placeholder="Izmijeni komentar"
            />
          )}
        />
        {errors.comment && <FieldError message="Komentar je obavezan." />}
      </div>

      {defaultImageUrl && (
        <div className="w-fit">
          <img
            src={defaultImageUrl}
            alt="Attached"
            className="max-w-[150px] rounded-md border border-gray-300"
          />
        </div>
      )}

      <div className="flex gap-2 items-center justify-end">
        <Button type="tertiary" onClick={onCancel}>
          Otkaži
        </Button>
        <Button type="tertiary">Spremi</Button>
      </div>
    </form>
  );
};

export default CommentEditForm;
