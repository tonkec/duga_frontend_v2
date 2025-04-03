import { useState } from 'react';
import { debounce } from 'lodash';
import Input from '../Input';
import { useGIFS } from './hooks';

interface GiphyResult {
  id: string;
  title: string;
  images: {
    fixed_height: { url: string };
    original: { url: string };
  };
}

interface GiphySearchProps {
  onGifSelect: (gifUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const GiphySearch = ({ onGifSelect, isOpen, onClose }: GiphySearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;
  const { allGIFS, gifsError, isGIFSLoading } = useGIFS(searchTerm, page, limit);

  const debouncedSetSearchTerm = debounce((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(e.target.value);
  };

  const handleGifSelect = (gifUrl: string) => {
    onGifSelect(gifUrl);
    setSearchTerm('');
    setPage(1);
    onClose();
  };

  const handleNextPage = () => {
    if (!isGIFSLoading && allGIFS?.length === limit) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (!isGIFSLoading && page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-2 p-2 border rounded bg-white">
      <Input
        type="text"
        placeholder="Pretraži GIPHY..."
        onChange={handleSearchChange}
        className="mb-2"
      />

      {isGIFSLoading ? (
        <div className="flex items-center justify-center h-20 text-gray-500">Učitavanje...</div>
      ) : gifsError ? (
        <div className="flex items-center justify-center h-20 text-red-500">
          Greška: {gifsError.message}
        </div>
      ) : allGIFS && allGIFS.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
          {allGIFS.map((gif: GiphyResult) => (
            <button
              key={gif.id}
              type="button"
              onClick={() => handleGifSelect(gif.images.original.url)}
              className="relative group rounded overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
            >
              <img
                src={gif.images.fixed_height.url}
                alt={gif.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 text-gray-500">
          {searchTerm ? 'Nema pronađenih GIF-ova' : 'Pretraži GIF-ove'}
        </div>
      )}

      {allGIFS && allGIFS.length > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || isGIFSLoading}
            className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            Prethodna
          </button>
          <span className="text-sm text-gray-600">Stranica {page}</span>
          <button
            onClick={handleNextPage}
            disabled={isGIFSLoading || allGIFS.length < limit}
            className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            Sljedeća
          </button>
        </div>
      )}
    </div>
  );
};

export default GiphySearch;
