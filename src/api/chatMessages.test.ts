import axios from 'axios';
import { getSearchGIFS, getTrendingGIFS } from './chatMessages';

jest.mock('axios');

const mockAxiosGet = jest.mocked(axios.get);

describe('Giphy API helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosGet.mockResolvedValue({ data: { data: [] } });
  });

  it('builds trending requests with URLSearchParams and a content rating', async () => {
    await getTrendingGIFS(2, 8);

    const url = new URL(mockAxiosGet.mock.calls[0][0] as string);

    expect(url.origin).toBe('https://api.giphy.com');
    expect(url.pathname).toBe('/v1/gifs/trending');
    expect(url.searchParams.get('api_key')).toBe('test-giphy-api-key');
    expect(url.searchParams.get('rating')).toBe('pg-13');
    expect(url.searchParams.get('bundle')).toBe('messaging_non_clips');
    expect(url.searchParams.get('limit')).toBe('8');
    expect(url.searchParams.get('offset')).toBe('8');
  });

  it('encodes search terms through URLSearchParams', async () => {
    await getSearchGIFS('cats & dogs', 1, 8);

    const url = new URL(mockAxiosGet.mock.calls[0][0] as string);

    expect(url.pathname).toBe('/v1/gifs/search');
    expect(url.searchParams.get('q')).toBe('cats & dogs');
    expect(url.searchParams.get('rating')).toBe('pg-13');
  });
});
