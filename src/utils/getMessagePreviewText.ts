import { IMessage } from '@app/pages/ChatPage/components/Message';
import { truncateString } from './truncateString';

const PREVIEW_MAX_LENGTH = 80;

export const getMessagePreviewText = (message: IMessage): string => {
  if (message.type === 'gif') return 'GIF';
  if (message.type === 'file' || message.securePhotoUrl || message.messagePhotoUrl) {
    return 'Fotografija';
  }
  if (!message.message?.trim()) return '';
  return truncateString(message.message.trim(), PREVIEW_MAX_LENGTH);
};
