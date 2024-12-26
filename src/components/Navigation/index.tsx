import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, useNavigate } from 'react-router';
import { BiGroup } from 'react-icons/bi';
import { BiUser } from 'react-icons/bi';
import { BiExit } from 'react-icons/bi';

const navigationStyles = 'flex justify-end space-x-4 bg-black p-4 shadow-sm text-white';

const Navigation = () => {
  const navigate = useNavigate();
  const [, saveAuthToken] = useLocalStorage('token', null);
  const [, saveUserId] = useLocalStorage('userId', null);
  const onLogout = () => {
    saveAuthToken(null);
    saveUserId(null);
    navigate('/login');
  };

  return (
    <nav className={navigationStyles}>
      <ul className="flex gap-2 space-x-4">
        <li>
          <Link to="/" className="flex items-center gap-1">
            <BiGroup fontSize={25} />
            Profili
          </Link>
        </li>
        <li>
          <Link to="/profile" className="flex items-center gap-1">
            <BiUser fontSize={22} /> Moj Profil
          </Link>
        </li>
        <li>
          <span className="cursor-pointer flex items-center gap-1" onClick={onLogout}>
            <BiExit fontSize={25} /> Logout
          </span>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
