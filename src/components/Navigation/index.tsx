import { useState, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Link } from 'react-router-dom';
import { BiExit } from 'react-icons/bi';
import { FiMenu, FiX } from 'react-icons/fi';
import ProfilePhoto from '@app/components/ProfilePhoto';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { getProfilePhoto, getProfilePhotoUrl } from '@app/utils/getProfilePhoto';
import { useCookies } from 'react-cookie';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Loader from '@app/components/Loader';
import { useAuth0 } from '@auth0/auth0-react';
import NotificationDropdown from './components/Notifications';
import OnlineStatus from './components/OnlineStatus';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { logout } = useAuth0();
  const [, setCookie] = useCookies(['token']);
  const [userId, saveUserId] = useLocalStorage('userId', null);
  const { allImages } = useGetAllImages(String(userId) || '');
  const { user: currentUser, isUserLoading } = useGetUserById(userId || '');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onLogout = () => {
    setCookie('token', '');
    saveUserId(null);
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const currentUserProfilePhoto = getProfilePhoto(allImages?.data.images);

  if (isUserLoading) return <Loader />;

  return (
    <>
      {!isMobile && (
        <nav className="flex justify-between items-center gradient p-4 shadow-sm text-white">
          <ul className="flex gap-4 items-center">
            <li>
              <ProfilePhoto
                currentUser={currentUser?.data}
                url={getProfilePhotoUrl(currentUserProfilePhoto)}
              />
            </li>
            <li>
              <Link to="/" className="flex items-center gap-1">
                <span>Početna</span>
                {String.fromCodePoint(parseInt('1F3D8', 16))}
              </Link>
            </li>
            <li>
              <Link to="/new-chat" className="flex items-center gap-2">
                <span>Poruke</span>
                {String.fromCodePoint(parseInt('1F4EB', 16))}
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center gap-1">
                <span>Profil</span>
                {String.fromCodePoint(parseInt('1F9D1', 16))}
              </Link>
            </li>
            {userId && <OnlineStatus userId={Number(userId)} />}
            <NotificationDropdown userId={userId} />
          </ul>
          <button onClick={onLogout} className="flex items-center gap-1">
            <BiExit fontSize={25} />
          </button>
        </nav>
      )}

      {isMobile && (
        <div className="flex justify-between items-center gradient p-4 shadow-sm text-white">
          <ProfilePhoto
            currentUser={currentUser?.data}
            url={getProfilePhotoUrl(currentUserProfilePhoto)}
          />
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white">
            <FiMenu size={24} />
          </button>
        </div>
      )}

      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative  max-w-xs h-full  p-6 shadow-lg">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <FiX size={24} />
            </button>

            <ul className="mt-12 space-y-6">
              <li>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-white text-lg"
                >
                  Početna
                </Link>
              </li>
              <li>
                <Link
                  to="/new-chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-white text-lg"
                >
                  Poruke
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-white text-lg"
                >
                  Profil
                </Link>
              </li>
              {userId && (
                <li>
                  <OnlineStatus userId={Number(userId)} />
                </li>
              )}
              <li>
                <NotificationDropdown userId={userId} />
              </li>
              <li>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-white text-lg mt-8"
                >
                  <BiExit fontSize={20} />
                  Odjava
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
