import { useEffect, useRef, useState } from 'react';
import { IUser } from '@app/components/UserCard';
import { useGetUserByUsername } from './hooks';
import { debounceScroll } from '@app/utils/debounceScroll';
import UserAvatar from '@app/components/UserAvatar';

const usernameRegex = /@([\w\d]*)$/;
type TaggedUser = { id: number; username: string };

interface MentionInputProps {
  value: string;
  onChange: (text: string) => void;
  onTagUsersChange?: (users: TaggedUser[]) => void;
  placeholder?: string;
  className?: string;
  textareaClassName?: string;
  initialTaggedUsers?: TaggedUser[];
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  'data-testid'?: string;
}

const MentionInput = ({
  value,
  onChange,
  onTagUsersChange,
  placeholder = 'Napiši komentar...',
  className = '',
  textareaClassName = '',
  initialTaggedUsers = [],
  rows = 3,
  maxLength,
  disabled = false,
  'data-testid': dataTestId,
}: MentionInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<IUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>(initialTaggedUsers);
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = debounceScroll(() => {
      setDebouncedQuery(rawQuery);
    }, 300);

    handler();
    return () => handler();
  }, [rawQuery]);

  const { userData } = useGetUserByUsername(debouncedQuery);

  useEffect(() => {
    if (userData?.data?.users) {
      setSuggestions(userData.data.users);
    } else {
      setSuggestions([]);
    }
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const match = val.match(usernameRegex);
    if (match) {
      const query = match[1].toLowerCase().trim();
      setRawQuery(query);
      setShowSuggestions(true);
    } else {
      setRawQuery('');
      setShowSuggestions(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const match = val.match(usernameRegex);

    if (match) {
      setShowSuggestions(true);
    }
  };

  const handleSelect = (user: TaggedUser) => {
    const match = value.match(usernameRegex);
    if (!match) return;

    const before = value.slice(0, match.index);
    const newVal = `${before}@${user.username} `;
    onChange(newVal);

    const matchedUsernames = Array.from(newVal.matchAll(/@([^\s]*)/g))
      .map(([, username]) => username)
      .filter((username) =>
        userData?.data.users.some((suggestedUser: IUser) => suggestedUser.username === username)
      )
      .map((username) => {
        const user = userData?.data.users.find(
          (suggestedUser: IUser) => suggestedUser.username === username
        );
        if (!user) return undefined;
        return { id: user.id, username: user.username };
      })
      .filter((matchedUser): matchedUser is TaggedUser => Boolean(matchedUser));

    if (!taggedUsers.some((u) => Number(u.id) === Number(user.id))) {
      // const updated = [...taggedUsers, user];
      const updated = matchedUsernames;
      setTaggedUsers(updated);
      onTagUsersChange?.(updated);
    }
    setShowSuggestions(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={`min-h-28 w-full resize-y rounded-2xl border border-[#dce4ff] bg-white px-4 py-3 text-base leading-6 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue ${textareaClassName}`}
        placeholder={placeholder}
        data-testid={dataTestId}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-48 overflow-y-auto rounded-2xl border border-[#dce4ff] bg-white shadow-lg">
          {suggestions.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelect({ id: user.id, username: user.username })}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-gray-800 transition-colors hover:bg-[#f0f4ff] hover:text-blue-dark active:bg-[#dce4ff]"
            >
              <UserAvatar
                avatarFallbackName={user.username}
                color="#2D46B9"
                userId={String(user.id)}
                className="h-8 w-8 shrink-0 rounded-full"
              />
              <span>@{user.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentionInput;
