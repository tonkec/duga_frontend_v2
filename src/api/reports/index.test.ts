import { apiClient } from '..';
import { submitProblemReport } from '.';

jest.mock('..', () => ({
  apiClient: jest.fn(),
}));

const mockApiClient = jest.mocked(apiClient);

describe('submitProblemReport', () => {
  it('submits reports to the backend instead of a browser email provider', async () => {
    const post = jest.fn().mockResolvedValue({ data: { ok: true } });
    mockApiClient.mockReturnValue({ post } as unknown as ReturnType<typeof apiClient>);

    await submitProblemReport({
      problemType: 'abuse',
      message: 'Neprimjerena poruka u chatu.',
    });

    expect(post).toHaveBeenCalledWith('/reports', {
      problemType: 'abuse',
      message: 'Neprimjerena poruka u chatu.',
    });
  });
});
