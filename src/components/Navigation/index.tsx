import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, useNavigate } from 'react-router';

const navigationStyles = 'flex justify-end space-x-4 bg-white p-4 shadow-sm';

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
      <ul className="flex space-x-4">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/profile">Moj Profil</Link>
        </li>
        <li>
          <span className="cursor-pointer" onClick={onLogout}>
            Logout
          </span>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
