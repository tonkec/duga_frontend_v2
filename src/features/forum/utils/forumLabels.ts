export const getVoteLabel = (count: number) => {
  const absoluteCount = Math.abs(count);
  return absoluteCount === 1 ? 'glas' : 'glasova';
};
