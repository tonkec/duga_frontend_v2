import { useEffect, useState } from 'react';
import Input from '@app/components/Input';
import EmojiPicker from '@app/components/EmojiPicker';
import { searchEmojiNatives } from '@app/utils/emojis';

interface IEmojiSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const EmojiSearch = ({ isOpen, onClose, onEmojiSelect }: IEmojiSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [emojis, setEmojis] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const search = async () => {
      const results = await searchEmojiNatives(searchTerm);
      if (isMounted) {
        setEmojis(results);
      }
    };

    search();

    return () => {
      isMounted = false;
    };
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="mt-2 rounded-2xl border border-[#dce4ff] bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-700">Emoji</p>
        <button
          type="button"
          className="rounded-full px-3 py-1 text-sm font-semibold text-gray-500 transition-colors hover:bg-[#f0f4ff] hover:text-blue"
          onClick={onClose}
        >
          Zatvori
        </button>
      </div>
      <Input
        type="text"
        placeholder="Pretraži emoji, npr. smile ili :)"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="mb-3 h-12 rounded-2xl border-[#dce4ff] px-4 text-base shadow-sm"
      />
      {emojis.length ? (
        <EmojiPicker
          emojis={emojis}
          variant="static"
          onEmojiSelect={(emoji) => {
            onEmojiSelect(emoji);
            setSearchTerm('');
            onClose();
          }}
        />
      ) : (
        <div className="flex h-20 items-center justify-center text-sm text-gray-500">
          Nema pronađenih emojija
        </div>
      )}
    </div>
  );
};

export default EmojiSearch;
