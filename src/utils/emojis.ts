import { SearchIndex } from 'emoji-mart';

type EmojiMartResult = {
  skins: {
    native: string;
  }[];
};

const COMMON_EMOJIS = [
  '😀',
  '😄',
  '😂',
  '😊',
  '😍',
  '😘',
  '🥰',
  '😎',
  '😉',
  '😢',
  '😭',
  '😡',
  '👍',
  '👎',
  '👏',
  '🙌',
  '🙏',
  '💪',
  '❤️',
  '🔥',
  '✨',
  '🎉',
  '🌈',
  '💬',
];

const EMOTICON_SEARCH_TERMS: Record<string, string> = {
  ':)': 'smile',
  ':-)': 'smile',
  ':D': 'grin',
  ':-D': 'grin',
  ';)': 'wink',
  ';-)': 'wink',
  ':(': 'disappointed',
  ':-(': 'disappointed',
  '<3': 'heart',
};

export const EMOJI_TOKEN_REGEX = /(^|\s)(:([^\s:]+)|:-?\)|:-?D|;-?\)|:-?\(|<3)$/;

const normalizeEmojiQuery = (query: string) => {
  const trimmedQuery = query.trim();
  const mappedQuery = EMOTICON_SEARCH_TERMS[trimmedQuery];

  if (mappedQuery) {
    return mappedQuery;
  }

  return trimmedQuery.replace(/^:/, '');
};

export const getEmojiSearchQueryFromText = (value: string) => {
  const match = value.match(EMOJI_TOKEN_REGEX);

  if (!match) {
    return null;
  }

  return normalizeEmojiQuery(match[2]);
};

export const searchEmojiNatives = async (query: string, limit = 48) => {
  const normalizedQuery = normalizeEmojiQuery(query);

  if (!normalizedQuery) {
    return COMMON_EMOJIS.slice(0, limit);
  }

  const emojis = await SearchIndex.search(normalizedQuery);
  const results = emojis
    .map((emoji: EmojiMartResult) => emoji.skins[0]?.native)
    .filter(Boolean) as string[];

  return Array.from(new Set(results)).slice(0, limit);
};

export const replaceEmojiToken = (value: string, emoji: string) => {
  const match = value.match(EMOJI_TOKEN_REGEX);

  if (!match || match.index === undefined) {
    return `${value}${emoji}`;
  }

  const prefix = match[1] ?? '';
  const beforeMatch = value.slice(0, match.index);

  return `${beforeMatch}${prefix}${emoji}`;
};
