import { Link } from 'react-router-dom';
import { BiExit } from 'react-icons/bi';
import OnlineStatus from '../Navigation/components/OnlineStatus';
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
      <Link
        to="/"
        onClick={onItemClick}
        className={`flex items-center gap-1 ${isMobile ? 'text-white text-lg' : ''}`}
      >
        <span>Početna</span>
        {!isMobile && String.fromCodePoint(parseInt('1F3D8', 16))}
      </Link>
      <Link
        to="/new-chat"
        onClick={onItemClick}
        className={`flex items-center gap-1 ${isMobile ? 'text-white text-lg' : ''}`}
      >
        <span>Poruke</span>
        {!isMobile && String.fromCodePoint(parseInt('1F4EB', 16))}
      </Link>
      <Link
        to="/profile"
        onClick={onItemClick}
        className={`flex items-center gap-1 ${isMobile ? 'text-white text-lg' : ''}`}
      >
        <span>Profil</span>
        {!isMobile && String.fromCodePoint(parseInt('1F9D1', 16))}
      </Link>
      {numericUserId && <OnlineStatus userId={numericUserId} />}
      <NotificationDropdown userId={numericUserId} />
      <button
        onClick={onLogout}
        className={`flex items-center gap-1 ${isMobile ? 'text-white text-lg mt-8' : ''}`}
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
    </>
  );
};
