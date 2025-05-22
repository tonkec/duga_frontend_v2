import { useState, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { FiMenu, FiX } from 'react-icons/fi';
import ProfilePhoto from '@app/components/ProfilePhoto';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { getProfilePhoto, getProfilePhotoUrl } from '@app/utils/getProfilePhoto';
import { useCookies } from 'react-cookie';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Loader from '@app/components/Loader';
import { useAuth0 } from '@auth0/auth0-react';
import { useWindowSize } from '@uidotdev/usehooks';
import { NavigationItems } from '../NavigationLinks';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width! < 768;
  const { logout } = useAuth0();
  const [, setCookie] = useCookies(['token']);
  const [userId, saveUserId] = useLocalStorage('userId', null);
  const { allImages } = useGetAllImages(String(userId) || '');
  const { user: currentUser, isUserLoading } = useGetUserById(userId || '');

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

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
          <div className="flex gap-4 items-center space-between w-full">
            <ProfilePhoto
              currentUser={currentUser?.data}
              url={getProfilePhotoUrl(currentUserProfilePhoto)}
            />
            <NavigationItems userId={userId} onLogout={onLogout} />
          </div>
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
        <div className="fixed inset-0 z-50 max-w-[200px]">
          <div
            className="absolute inset-0 bg-blue opacity-90"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative h-full p-6 shadow-lg">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-2 text-white"
            >
              <FiX size={24} />
            </button>

            <ul className="mt-12 space-y-6">
              <NavigationItems
                userId={userId}
                isMobile
                onItemClick={() => setIsMobileMenuOpen(false)}
                onLogout={onLogout}
              />
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
