import { useQuery } from '@tanstack/react-query';
import { getTrendingGIFS, getSearchGIFS } from '../../../api/chatMessages';

export const useGIFS = (term: string) => {
  const {
    data: allGIFS,
    error: gifsError,
    isPending: isGIFSLoading,
  } = useQuery({
    queryKey: ['gifs', term],
    queryFn: () => (term ? getSearchGIFS(term) : getTrendingGIFS()),
  });

  return { allGIFS, gifsError, isGIFSLoading };
};
