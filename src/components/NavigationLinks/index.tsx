import { Link } from 'react-router-dom';
import { BiExit } from 'react-icons/bi';
import NotificationDropdown from '../Navigation/components/Notifications';

interface NavigationItemsProps {
  userId: string | null;
  isMobile?: boolean;
  onItemClick?: () => void;
  onLogout: () => void;
}

export const NavigationItems = ({
  userId,
  isMobile = false,
  onItemClick,
  onLogout,
}: NavigationItemsProps) => {
  const numericUserId = userId ? Number(userId) : null;

  return (
    <>
      <div className="flex items-center space-between w-full">
        <div className={`${isMobile ? 'block w-full' : 'flex'}  items-center space-between gap-6`}>
          <Link
            to="/"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-lg bg-black text-white hover:bg-white hover:text-black flex-1 px-2 py-1 rounded mb-2 w-full justify-center '}`}
          >
            <span>Početna</span>
            {!isMobile && String.fromCodePoint(parseInt('1F3D8', 16))}
          </Link>
          <Link
            to="/new-chat"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-lg bg-black text-white hover:bg-white hover:text-black px-2 py-1 rounded mb-2 w-full justify-center '}`}
          >
            <span>Poruke</span>
            {!isMobile && String.fromCodePoint(parseInt('1F4EB', 16))}
          </Link>
          <Link
            to="/profile"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-lg bg-black text-white hover:bg-white hover:text-black px-2 py-1 rounded mb-2 w-full justify-center '}`}
          >
            <span>Profil</span>
            {!isMobile && String.fromCodePoint(parseInt('1F9D1', 16))}
          </Link>

          <Link
            to="/settings"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-lg bg-black text-white hover:bg-white hover:text-black px-2 py-1 rounded mb-2 w-full justify-center '}`}
          >
            <span>Postavke</span>
            {!isMobile && String.fromCodePoint(9881, 65039)}
          </Link>

          <div>
            <NotificationDropdown userId={numericUserId} isMobile={isMobile} />
          </div>
        </div>
      </div>

      <div className={isMobile ? 'absolute bottom-2 left-6 right-6' : 'relative'}>
        <button
          onClick={onLogout}
          className={`flex items-center gap-1 ${isMobile && 'text-lg bg-black text-white hover:bg-white hover:text-black flex-1 px-2 py-1 rounded mb-2 w-full flex-1 justify-center '}`}
        >
          {isMobile ? (
            <>
              <span>Odjava</span>
              <BiExit fontSize={20} />
            </>
          ) : (
            <BiExit fontSize={25} />
          )}
        </button>
      </div>
    </>
  );
};
