import { useState, useRef } from 'react';
import { debounce } from 'lodash';
import type { IEmoji } from '@app/pages/ChatPage/components/SendMessage';
import emojiData from '@emoji-mart/data';

interface UseEmojiSearch {
  emojis: string[];
  handleSearch: (value: string) => void;
}

type EmojiMartSearchIndex = {
  search: (value: string, options?: { maxResults?: number; caller?: string }) => Promise<IEmoji[]>;
};

export const useEmojiSearch = (debounceTime: number = 300): UseEmojiSearch => {
  const [emojis, setEmojis] = useState<string[]>([]);
  const indexRef = useRef<EmojiMartSearchIndex | null>(null);

  const isInitialized = useRef(false);

  const initializeIndex = async () => {
    if (!isInitialized.current) {
      const module = await import('emoji-mart');
      const SearchIndexCtor = (
        module as unknown as {
          SearchIndex: new (options: { data: unknown }) => {
            search: (value: string) => Promise<IEmoji[]>;
          };
        }
      ).SearchIndex;

      indexRef.current = new SearchIndexCtor({ data: emojiData });
      isInitialized.current = true;
    }
  };

  const search = async (value: string): Promise<string[]> => {
    await initializeIndex();
    if (!indexRef.current) return [];

    const results = await indexRef.current.search(value);
    return results.map((emoji: IEmoji) => emoji.skins[0].native);
  };

  const handleSearch = async (value: string) => {
    const emojiRegex = /(?:\s|^):([^\s:]+)/;
    const match = value.match(emojiRegex);

    if (match) {
      const searchTerm = match[1];
      const searchResults = await search(searchTerm);
      setEmojis(searchResults);
    } else {
      setEmojis([]);
    }
  };

  const debouncedHandleSearch = debounce(handleSearch, debounceTime);

  return {
    emojis,
    handleSearch: debouncedHandleSearch,
  };
};

export default useEmojiSearch;
