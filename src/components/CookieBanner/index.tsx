import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookieAccepted');
    const rejectedAt = localStorage.getItem('cookieRejectedAt');

    if (!accepted && !rejectedAt) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieAccepted', 'true');
    localStorage.removeItem('cookieRejectedAt');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    const now = new Date().toISOString();
    localStorage.setItem('cookieRejectedAt', now);
    localStorage.removeItem('cookieAccepted');
    setShowBanner(false);

    toast.info('Neke funkcije neće raditi jer ste odbili kolačiće.', {
      position: 'top-center',
      autoClose: 5000,
    });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Kolačići</h2>
        <p className="mb-6">
          Koristimo kolačiće za poboljšanje korisničkog iskustva. Prihvati ili odbij kako bi
          nastavio.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={rejectCookies} className="bg-slate-900 text-white px-4 py-2 rounded">
            Odbij
          </button>
          <button onClick={acceptCookies} className="bg-pink text-white px-4 py-2 rounded">
            Prihvati
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
