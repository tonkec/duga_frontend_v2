import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

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
  return (
    <div className="relative" ref={dropdownRef}>
      <span
        className="cursor-pointer text-sm text-blue-600 hover:underline"
        onClick={() => setOpen((prev) => !prev)}
      >
        {likes?.length > 0
          ? `${likes.length} ${getLikesTranslation(likes.length)}`
          : 'Nema lajkova'}
      </span>

      {open && (
        <div className="absolute mt-2 bg-white shadow-md rounded-lg p-2 max-h-60 overflow-y-auto w-56 z-10">
          {likes.length === 0 ? (
            <p className="text-gray-500 text-sm">Nema još lajkova.</p>
          ) : (
            likes.map((like) => (
              <div
                key={like.id}
                className="text-sm py-1 px-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  navigate(`/user/${like.userId}`);
                }}
              >
                {like.user?.username || `User #${like.userId}`}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoLikeDropdown;
