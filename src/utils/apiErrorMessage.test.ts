import { getApiErrorMessage } from './apiErrorMessage';

describe('getApiErrorMessage', () => {
  it('reads string errors returned by the API', () => {
    expect(
      getApiErrorMessage(
        {
          response: {
            data: {
              errors: ['csrf_failed'],
            },
          },
        },
        'Fallback'
      )
    ).toBe('csrf_failed');
  });

  it('reads structured error reasons returned by the API', () => {
    expect(
      getApiErrorMessage(
        {
          response: {
            data: {
              errors: [{ reason: 'Fotografija ne smije sadržavati eksplicitan sadržaj.' }],
            },
          },
        },
        'Fallback'
      )
    ).toBe('Fotografija ne smije sadržavati eksplicitan sadržaj.');
  });

  it('falls back when the API response has no readable message', () => {
    expect(getApiErrorMessage({ response: { data: { errors: [] } } }, 'Fallback')).toBe('Fallback');
  });
});
