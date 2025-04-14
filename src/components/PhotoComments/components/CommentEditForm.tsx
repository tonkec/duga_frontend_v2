import Button from '../../Button';
import { IUser } from '../../UserCard';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MentionInput from '../../MentionInput';
import FieldError from '../../FieldError';

const schema = z.object({ comment: z.string().min(1) });

interface Props {
  defaultValue: string;
  onCancel: () => void;
  onSubmitForm: (comment: string, taggedUsers: IUser[]) => void;
}

const CommentEditForm = ({ defaultValue, onCancel, onSubmitForm }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { comment: defaultValue },
  });

  const taggedUsers: IUser[] = [];

  const onSubmit = (data: { comment: string }) => {
    if (!isValid) return;
    onSubmitForm(data.comment, taggedUsers);
  };

  return (
    <form className="flex gap-2 justify-between w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col w-full">
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <MentionInput
              value={field.value}
              onChange={field.onChange}
              onTagUsersChange={(users) => taggedUsers.splice(0, taggedUsers.length, ...users)}
              placeholder="Izmijeni komentar"
            />
          )}
        />
        {errors.comment && <FieldError message="Komentar je obavezan." />}
      </div>
      <div className="flex gap-2 items-start pt-1">
        <Button type="tertiary" onClick={onCancel}>
          Otkaži
        </Button>
        <Button type="tertiary">Spremi</Button>
      </div>
    </form>
  );
};

export default CommentEditForm;
