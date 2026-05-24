import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import UserAvatar from '@app/components/UserAvatar';

interface IUser {
  id: number;
  username: string;
}

interface ILike {
  id: number;
  userId: string;
  user?: IUser;
}

interface PhotoLikeDropdownProps {
  likes: ILike[];
}

const getLikesTranslation = (likesNumber: number) => {
  switch (likesNumber) {
    case 1:
      return 'lajk';
    case 2:
    case 3:
    case 4:
      return 'lajka';
    case 5:
      return 'lajkova';
    default:
      return 'lajkova';
  }
};

const PhotoLikeDropdown: React.FC<PhotoLikeDropdownProps> = ({ likes }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shouldShowDropdown = likes?.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={`rounded-full text-sm font-semibold transition-colors ${
          shouldShowDropdown
            ? 'cursor-pointer text-blue underline hover:text-blue/80'
            : 'cursor-default text-gray-500'
        }`}
        onClick={() => setOpen((prev) => !prev)}
        disabled={!shouldShowDropdown}
      >
        {likes?.length > 0
          ? `${likes.length} ${getLikesTranslation(likes.length)}`
          : 'Nema lajkova'}
      </button>

      {shouldShowDropdown && open && (
        <div className="absolute bottom-full left-0 z-20 mb-3 w-72 overflow-hidden rounded-2xl border border-[#dce4ff] bg-white shadow-xl shadow-blue/10">
          <div className="border-b border-[#edf1ff] px-4 py-3">
            <p className="text-sm font-bold text-gray-900">Sviđanja</p>
            <p className="text-xs text-gray-500">
              {likes.length} {getLikesTranslation(likes.length)}
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {likes.map((like) => (
              <button
                type="button"
                key={like.id}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#f7f9ff]"
                onClick={() => {
                  setOpen(false);
                  navigate(`/user/${like.userId}`);
                }}
              >
                <UserAvatar
                  userId={String(like.userId)}
                  avatarFallbackName={like.user?.username || `User ${like.userId}`}
                  color="#2D46B9"
                  size="36"
                  className="rounded-full"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {like.user?.username || `User #${like.userId}`}
                  </p>
                  <p className="text-xs text-gray-500">Sviđa mu_joj se fotografija</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoLikeDropdown;
