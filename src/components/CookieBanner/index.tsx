import { useCookieConsent } from '@app/hooks/useCookieConsent';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [cookies] = useCookies(['cookieAccepted', 'cookieRejectedAt']);
  const { acceptCookies, rejectCookies } = useCookieConsent();

  useEffect(() => {
    const accepted = cookies.cookieAccepted;
    const rejectedAt = cookies.cookieRejectedAt;

    if (!accepted && !rejectedAt) {
      setShowBanner(true);
    }
  }, [cookies]);

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Kolačići</h2>
        <p className="mb-6">
          Koristimo{' '}
          <Link to="/cookie-policy" className="text-blue underline">
            kolačiće
          </Link>{' '}
          za poboljšanje korisničkog iskustva.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              acceptCookies();
              setShowBanner(false);
            }}
            className="bg-pink text-white px-4 py-2 rounded"
          >
            Prihvati
          </button>

          <button
            onClick={() => {
              rejectCookies();
              setShowBanner(false);
            }}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Odbij
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
