import { apiClient } from '.';
import { getAppSessionId } from './appSession';

export const startSession = () => {
  const client = apiClient();
  const sessionId = getAppSessionId();

  return client.post('/sessions/start', { sessionId });
};
