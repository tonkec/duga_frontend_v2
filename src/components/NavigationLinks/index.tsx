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
        <div className={`${isMobile ? 'block' : 'flex'}  items-center space-between gap-4`}>
          <Link
            to="/"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-white text-lg'}`}
          >
            <span>Početna</span>
            {!isMobile && String.fromCodePoint(parseInt('1F3D8', 16))}
          </Link>
          <Link
            to="/new-chat"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-white text-lg'}`}
          >
            <span>Poruke</span>
            {!isMobile && String.fromCodePoint(parseInt('1F4EB', 16))}
          </Link>
          <Link
            to="/profile"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-white text-lg'}`}
          >
            <span>Profil</span>
            {!isMobile && String.fromCodePoint(parseInt('1F9D1', 16))}
          </Link>

          <Link
            to="/settings"
            onClick={onItemClick}
            className={`flex items-center gap-1 ${isMobile && 'text-white text-lg'}`}
          >
            <span>Postavke</span>
            {!isMobile && String.fromCodePoint(9881, 65039)}
          </Link>

          <div>
            <NotificationDropdown userId={numericUserId} />
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={onLogout}
          className={`flex items-center gap-1 ${isMobile && 'text-white text-lg mt-8'}`}
        >
          {isMobile ? (
            <>
              <BiExit fontSize={20} />
              <span>Odjava</span>
            </>
          ) : (
            <BiExit fontSize={25} />
          )}
        </button>
      </div>
    </>
  );
};
