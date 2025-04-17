import { useQuery } from '@tanstack/react-query';
import { getTrendingGIFS, getSearchGIFS } from '@app/api/chatMessages';

export const useGIFS = (term: string, page: number = 1, limit: number = 8) => {
  const {
    data: allGIFS,
    error: gifsError,
    isPending: isGIFSLoading,
  } = useQuery({
    queryKey: ['gifs', term, page],
    queryFn: () => (term ? getSearchGIFS(term, page, limit) : getTrendingGIFS(page, limit)),
  });

  return { allGIFS, gifsError, isGIFSLoading };
};
