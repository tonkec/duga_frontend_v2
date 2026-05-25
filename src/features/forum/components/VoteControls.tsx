import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import type { VoteMetadata, VoteValue } from '../types/forum.types';

interface VoteControlsProps {
  item: VoteMetadata;
  isPending: boolean;
  onVote: (value: VoteValue) => void;
  onClearVote: () => void;
  className?: string;
}

export const getVoteScore = (item: VoteMetadata) => {
  if (typeof item.voteScore === 'number') return item.voteScore;
  if (typeof item.score === 'number') return item.score;
  if (typeof item.votes === 'number') return item.votes;
  if (typeof item.upvotes === 'number' || typeof item.downvotes === 'number') {
    return (item.upvotes ?? 0) - (item.downvotes ?? 0);
  }

  return 0;
};

const getCurrentVote = (item: VoteMetadata): VoteValue | null => {
  return item.currentUserVote ?? item.userVote ?? item.myVote ?? null;
};

const VoteControls = ({
  item,
  isPending,
  onVote,
  onClearVote,
  className = '',
}: VoteControlsProps) => {
  const currentVote = getCurrentVote(item);

  const handleVote = (value: VoteValue) => {
    if (isPending) return;

    if (currentVote === value) {
      onClearVote();
      return;
    }

    onVote(value);
  };

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-full border border-[#dce4ff] bg-[#f7f9ff] text-sm font-semibold text-gray-700 ${className}`}
      aria-label="Glasanje"
    >
      <button
        type="button"
        disabled={isPending}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleVote(1);
        }}
        className={`grid h-9 w-10 place-items-center transition-colors hover:bg-blue/10 disabled:cursor-not-allowed disabled:opacity-60 ${
          currentVote === 1 ? 'bg-blue text-white hover:bg-blue' : 'text-blue'
        }`}
        aria-label="Glasaj za"
      >
        <BiChevronUp size={22} />
      </button>
      <span className="min-w-10 px-3 text-center tabular-nums">{getVoteScore(item)}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleVote(-1);
        }}
        className={`grid h-9 w-10 place-items-center transition-colors hover:bg-red/10 disabled:cursor-not-allowed disabled:opacity-60 ${
          currentVote === -1 ? 'bg-red text-white hover:bg-red' : 'text-red'
        }`}
        aria-label="Glasaj protiv"
      >
        <BiChevronDown size={22} />
      </button>
    </div>
  );
};

export default VoteControls;
