import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import VoteControls, { getVoteScore } from './VoteControls';

describe('VoteControls', () => {
  it('calls upvote and downvote handlers', () => {
    const onVote = jest.fn();
    const onClearVote = jest.fn();

    render(
      <VoteControls
        item={{ voteScore: 0, currentUserVote: null }}
        isPending={false}
        onVote={onVote}
        onClearVote={onClearVote}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Glasaj za' }));
    fireEvent.click(screen.getByRole('button', { name: 'Glasaj protiv' }));

    expect(onVote).toHaveBeenNthCalledWith(1, 1);
    expect(onVote).toHaveBeenNthCalledWith(2, -1);
    expect(onClearVote).not.toHaveBeenCalled();
  });

  it('clears the vote when the active vote is clicked again', () => {
    const onVote = jest.fn();
    const onClearVote = jest.fn();

    render(
      <VoteControls
        item={{ voteScore: 5, currentUserVote: 1 }}
        isPending={false}
        onVote={onVote}
        onClearVote={onClearVote}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Glasaj za' }));

    expect(onClearVote).toHaveBeenCalledTimes(1);
    expect(onVote).not.toHaveBeenCalled();
  });

  it('clears the current vote before applying the opposite vote', () => {
    const onVote = jest.fn();
    const onClearVote = jest.fn();

    render(
      <VoteControls
        item={{ voteScore: 2, currentUserVote: 1 }}
        isPending={false}
        onVote={onVote}
        onClearVote={onClearVote}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Glasaj protiv' }));

    expect(onClearVote).toHaveBeenCalledTimes(1);
    expect(onVote).not.toHaveBeenCalled();
  });

  it('does not vote while a vote request is pending', () => {
    const onVote = jest.fn();
    const onClearVote = jest.fn();

    render(
      <VoteControls
        item={{ voteScore: 0, currentUserVote: null }}
        isPending
        onVote={onVote}
        onClearVote={onClearVote}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Glasaj za' }));
    fireEvent.click(screen.getByRole('button', { name: 'Glasaj protiv' }));

    expect(onVote).not.toHaveBeenCalled();
    expect(onClearVote).not.toHaveBeenCalled();
  });

  it('calculates score from available vote metadata fallbacks', () => {
    expect(getVoteScore({ voteScore: 4 })).toBe(4);
    expect(getVoteScore({ score: 3 })).toBe(3);
    expect(getVoteScore({ votes: 2 })).toBe(2);
    expect(getVoteScore({ upvotes: 5, downvotes: 2 })).toBe(3);
    expect(getVoteScore({})).toBe(0);
  });
});
