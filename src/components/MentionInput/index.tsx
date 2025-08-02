import { useEffect, useRef, useState } from 'react';
import { IUser } from '@app/components/UserCard';
import { useGetUserByUsername } from './hooks';
import { debounceScroll } from '@app/utils/debounceScroll';

const usernameRegex = /@([\w\d]*)$/;

interface MentionInputProps {
  value: string;
  onChange: (text: string) => void;
  onTagUsersChange?: (users: Array<{ id: number; username: string }>) => void;
  placeholder?: string;
  className?: string;
  initialTaggedUsers?: Array<{ id: number; username: string }>;
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
  const [taggedUsers, setTaggedUsers] =
    useState<Array<{ id: number; username: string }>>(initialTaggedUsers);
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

  const handleSelect = (user: { id: number; username: string }) => {
    const match = value.match(usernameRegex);
    if (!match) return;

    const before = value.slice(0, match.index);
    const newVal = `${before}@${user.username} `;
    onChange(newVal);

    const matchedUsernames = Array.from(newVal.matchAll(/@([^\s]*)/g))
      .map(([, username]) => username)
      .filter((username) => userData?.data.users.some((u) => u.username === username))
      .map((username) => {
        const user = userData?.data.users.find((u) => u.username === username);
        if (!user) return undefined;
        return { id: user.id, username: user.username };
      })
      .filter(Boolean);

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
        className="w-full p-2 border border-gray-300 rounded"
        placeholder={placeholder}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 top-full left-0 right-0 bg-white shadow-lg border rounded max-h-48 overflow-y-auto">
          {suggestions.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelect({ id: user.id, username: user.username })}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              @{user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentionInput;
