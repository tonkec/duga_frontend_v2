import { apiClient } from '..';

export type ReportProblemType =
  | 'bug_ui'
  | 'bug_chat'
  | 'bug_upload'
  | 'bug_forum'
  | 'login_access'
  | 'profile_issue'
  | 'harassment'
  | 'fake_profile'
  | 'inappropriate_photo'
  | 'inappropriate_message'
  | 'spam_scam'
  | 'safety_privacy'
  | 'suggestion'
  | 'other';

export interface ReportProblemPayload {
  problemType: ReportProblemType;
  message: string;
}

export const submitProblemReport = async (payload: ReportProblemPayload) => {
  const client = apiClient();
  return client.post('/reports', payload);
};
