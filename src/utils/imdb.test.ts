import { getImdbTitleId, getImdbTitleUrl, isImdbTitleUrl } from './imdb';

describe('IMDb URL utilities', () => {
  it('normalizes supported IMDb title values to canonical URLs', () => {
    expect(getImdbTitleUrl('tt0111161')).toBe('https://www.imdb.com/title/tt0111161/');
    expect(getImdbTitleUrl('/title/tt0111161/?ref_=fn_al_tt_1')).toBe(
      'https://www.imdb.com/title/tt0111161/'
    );
    expect(getImdbTitleUrl('https://m.imdb.com/title/tt0111161/')).toBe(
      'https://www.imdb.com/title/tt0111161/'
    );
    expect(getImdbTitleId('/title/tt0111161/?ref_=fn_al_tt_1')).toBe('tt0111161');
  });

  it('rejects non-title IMDb values', () => {
    expect(isImdbTitleUrl(null)).toBe(false);
    expect(isImdbTitleUrl(undefined)).toBe(false);
    expect(isImdbTitleUrl('')).toBe(false);
    expect(isImdbTitleUrl('https://www.imdb.com/name/nm0000209/')).toBe(false);
    expect(isImdbTitleUrl('not-an-imdb-title')).toBe(false);
  });
});
