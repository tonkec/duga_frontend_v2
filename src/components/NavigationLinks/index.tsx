import { NavLink } from 'react-router-dom';
import { BiCog, BiExit, BiGroup, BiHomeAlt, BiMessageRounded, BiUser } from 'react-icons/bi';
import NotificationDropdown from '../Navigation/components/Notifications';

interface NavigationItemsProps {
  userId: string | number | null;
  isMobile?: boolean;
  onItemClick?: () => void;
  onLogout: () => void;
}

const navItems = [
  { to: '/', label: 'Početna', icon: <BiHomeAlt fontSize={20} /> },
  { to: '/new-chat', label: 'Poruke', icon: <BiMessageRounded fontSize={20} /> },
  { to: '/users', label: 'Korisnici', icon: <BiGroup fontSize={20} /> },
  { to: '/profile', label: 'Profil', icon: <BiUser fontSize={20} /> },
  { to: '/settings', label: 'Postavke', icon: <BiCog fontSize={20} /> },
];

export const NavigationItems = ({
  userId,
  isMobile = false,
  onItemClick,
  onLogout,
}: NavigationItemsProps) => {
  const numericUserId = userId ? Number(userId) : null;
  const linkBase = isMobile
    ? 'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-colors'
    : 'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors';
  const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${
      isActive
        ? isMobile
          ? 'bg-white text-blue shadow-sm'
          : 'bg-white text-blue shadow-sm'
        : isMobile
          ? 'text-white/90 hover:bg-white/10 hover:text-white'
          : 'text-white/90 hover:bg-white/15 hover:text-white'
    }`;

  return (
    <>
      <div className={isMobile ? 'w-full space-y-2' : 'flex items-center gap-2'}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onItemClick}
            className={getLinkClassName}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className={isMobile ? 'pt-2' : 'ml-1'}>
          <NotificationDropdown userId={numericUserId} isMobile={isMobile} />
        </div>
      </div>

      <div className={isMobile ? 'mt-auto pt-6' : 'ml-auto'}>
        <button
          onClick={onLogout}
          className={
            isMobile
              ? 'flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue'
              : 'flex items-center gap-2 rounded-full px-3 py-2 text-white/90 transition-colors hover:bg-white/15 hover:text-white'
          }
        >
          <BiExit fontSize={22} />
          {isMobile && <span>Odjava</span>}
        </button>
      </div>
    </>
  );
};
