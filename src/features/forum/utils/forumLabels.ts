export const getVoteLabel = (count: number) => {
  const absoluteCount = Math.abs(count);
  if (absoluteCount === 1) return 'glas';
  if (absoluteCount >= 2 && absoluteCount <= 4) return 'glasa';

  return 'glasova';
};
