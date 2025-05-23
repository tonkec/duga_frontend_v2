import { toastConfig } from '@app/configs/toast.config';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';

export const useCookieConsent = () => {
  const [, setCookie, removeCookie] = useCookies(['cookieAccepted', 'cookieRejectedAt']);

  const acceptCookies = () => {
    setCookie('cookieAccepted', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    removeCookie('cookieRejectedAt', { path: '/' });

    toast.success('Kolačići su prihvaćeni.', toastConfig);
  };

  const rejectCookies = () => {
    const now = new Date().toISOString();
    setCookie('cookieRejectedAt', now, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    removeCookie('cookieAccepted', { path: '/' });

    toast.info('Neke funkcije neće raditi jer ste odbili kolačiće.', toastConfig);
  };

  return {
    acceptCookies,
    rejectCookies,
  };
};
