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
  initialTaggedUsers?: TaggedUser[];
}

const MentionInput = ({
  value,
  onChange,
  onTagUsersChange,
  placeholder = 'Napiši komentar...',
  className = '',
  initialTaggedUsers = [],
}: MentionInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
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
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className="h-14 w-full rounded-2xl border border-[#dce4ff] bg-white px-4 text-base shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue"
        placeholder={placeholder}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-48 overflow-y-auto rounded-2xl border border-[#dce4ff] bg-white shadow-lg">
          {suggestions.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelect({ id: user.id, username: user.username })}
              className="flex cursor-pointer items-center gap-2 p-2 hover:bg-gray-100"
            >
              <UserAvatar
                avatarFallbackName={user.username}
                color="#F037A5"
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
