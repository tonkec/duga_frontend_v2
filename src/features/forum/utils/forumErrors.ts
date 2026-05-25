import axios from 'axios';

const getStringValue = (value: unknown) => (typeof value === 'string' ? value : undefined);

const getErrorsMessage = (errors: unknown) => {
  if (!Array.isArray(errors)) {
    return undefined;
  }

  const messages = errors
    .map((error) => {
      if (typeof error === 'string') {
        return error;
      }

      if (!error || typeof error !== 'object') {
        return undefined;
      }

      const errorData = error as Record<string, unknown>;
      return (
        getStringValue(errorData.reason) ||
        getStringValue(errorData.message) ||
        getStringValue(errorData.error)
      );
    })
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join(' ') : undefined;
};

export const getForumErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const errorData = data as Record<string, unknown>;
  return (
    getErrorsMessage(errorData.errors) ||
    getStringValue(errorData.reason) ||
    getStringValue(errorData.message) ||
    getStringValue(errorData.error) ||
    fallback
  );
};
