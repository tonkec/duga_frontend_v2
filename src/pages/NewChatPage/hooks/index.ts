import { useMutation } from '@tanstack/react-query';
import { createChat } from '../../../api/chats';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';

export const useCreateNewChat = () => {
  const {
    mutate: onCreateChat,
    isPending: isCreatingChat,
    isError: isCreateChatError,
    isSuccess: isCreateChatSuccess,
  } = useMutation({
    mutationFn: (data: { userId: string; partnerId: string }) => createChat(data),
    onSuccess: (data) => {
      console.log(data);
      toast.success('Razgovor uspješno kreiran', toastConfig);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return { onCreateChat, isCreatingChat, isCreateChatError, isCreateChatSuccess };
};
