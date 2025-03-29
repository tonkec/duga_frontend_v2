import { useEffect, useRef, useState } from 'react';
import { IUser } from '../UserCard';
import { useGetUserByUsername } from './hooks';
import { debounceScroll } from '../../utils/debounceScroll';

interface MentionInputProps {
  value: string;
  onChange: (text: string) => void;
  onTagUsersChange?: (users: IUser[]) => void;
  placeholder?: string;
  className?: string;
}

const MentionInput = ({
  value,
  onChange,
  onTagUsersChange,
  placeholder = 'Write a comment...',
  className = '',
}: MentionInputProps) => {
  const [suggestions, setSuggestions] = useState<IUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<IUser[]>([]);
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

    const match = val.match(/@(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      setRawQuery(query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (user: IUser) => {
    const match = value.match(/@(\w*)$/);
    if (!match) return;

    const before = value.slice(0, match.index);
    const newVal = `${before}@${user.username} `;
    onChange(newVal);

    if (!taggedUsers.find((u) => u.id === user.id)) {
      const updated = [...taggedUsers, user];
      setTaggedUsers(updated);
      onTagUsersChange?.(updated);
    }
    setShowSuggestions(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-full p-2 border border-gray-300 rounded"
        placeholder={placeholder}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 top-full left-0 right-0 bg-white shadow-lg border rounded max-h-48 overflow-y-auto">
          {suggestions.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelect(user)}
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
