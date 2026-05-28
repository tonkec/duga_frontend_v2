import { apiClient } from '..';

export type ReportProblemType = 'bug' | 'abuse' | 'inappropriate' | 'account' | 'other';

export interface ReportProblemPayload {
  problemType: ReportProblemType;
  message: string;
}

export const submitProblemReport = async (payload: ReportProblemPayload) => {
  const client = apiClient();
  return client.post('/reports', payload);
};
