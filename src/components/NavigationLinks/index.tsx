import { NavLink } from 'react-router-dom';
import {
  BiCog,
  BiFlag,
  BiGroup,
  BiHelpCircle,
  BiHomeAlt,
  BiMessageRounded,
  BiUser,
} from 'react-icons/bi';
import { FiLogOut } from 'react-icons/fi';
import NotificationDropdown from '../Navigation/components/Notifications';

interface NavigationItemsProps {
  userId: string | number | null;
  isMobile?: boolean;
  isSidebar?: boolean;
  onItemClick?: () => void;
  onLogout: () => void;
}

const navItems = [
  { to: '/', label: 'Početna', icon: <BiHomeAlt fontSize={20} /> },
  { to: '/new-chat', label: 'Poruke', icon: <BiMessageRounded fontSize={20} /> },
  { to: '/profile', label: 'Profil', icon: <BiUser fontSize={20} /> },
  { to: '/users', label: 'Korisnici', icon: <BiGroup fontSize={20} /> },
  { to: '/forum', label: 'Forum', icon: <BiHelpCircle fontSize={20} /> },
  { to: '/settings', label: 'Postavke', icon: <BiCog fontSize={20} /> },
  { to: '/report', label: 'Prijavi problem', icon: <BiFlag fontSize={20} /> },
  { to: '/help', label: 'Pomoć', icon: <BiHelpCircle fontSize={20} /> },
];

export const NavigationItems = ({
  userId,
  isMobile = false,
  isSidebar = false,
  onItemClick,
  onLogout,
}: NavigationItemsProps) => {
  const numericUserId = userId ? Number(userId) : null;
  const linkBase =
    isMobile || isSidebar
      ? 'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-all'
      : 'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all';
  const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${
      isActive
        ? isMobile || isSidebar
          ? 'bg-white text-blue shadow-sm'
          : 'bg-white text-blue shadow-md shadow-blue-dark/10'
        : isMobile || isSidebar
          ? 'text-white/90 hover:bg-white/10 hover:text-white'
          : 'text-white/90 hover:bg-white/15 hover:text-white hover:-translate-y-0.5'
    }`;

  return (
    <>
      <div className={isMobile || isSidebar ? 'w-full space-y-2' : 'flex items-center gap-1.5'}>
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

        {!isSidebar && !isMobile && (
          <div className={isMobile ? 'pt-2' : 'ml-1'}>
            <NotificationDropdown userId={numericUserId} isMobile={isMobile} />
          </div>
        )}
      </div>

      <div className={isMobile || isSidebar ? 'mt-auto pt-6' : 'ml-auto'}>
        <button
          onClick={onLogout}
          aria-label="Odjava"
          title="Odjava"
          className={
            isMobile
              ? 'flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue'
              : isSidebar
                ? 'flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-semibold text-white transition-colors hover:bg-white/20 hover:text-white'
                : 'flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
          }
        >
          <FiLogOut size={20} strokeWidth={2.4} />
          {(isMobile || isSidebar) && <span>Odjava</span>}
        </button>
      </div>
    </>
  );
};
