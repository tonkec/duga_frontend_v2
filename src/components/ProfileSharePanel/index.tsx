import { useState } from 'react';
import { BiCheck, BiCopy, BiLink } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import Button from '@app/components/Button';
import Card from '@app/components/Card';
import { getUserProfilePath } from '@app/utils/userProfilePath';

interface ProfileSharePanelProps {
  userId: string | number | undefined;
  publicId?: string;
  username?: string;
  isOwnProfile?: boolean;
}

const ProfileSharePanel = ({
  userId,
  publicId,
  username,
  isOwnProfile = false,
}: ProfileSharePanelProps) => {
  const [hasCopied, setHasCopied] = useState(false);
  const profilePath = publicId || userId ? getUserProfilePath({ id: userId, publicId }) : '';
  const profileLabel = isOwnProfile
    ? 'svoj profil'
    : `profil korisnika_ce ${username ?? ''}`.trim();

  const handleCopy = async () => {
    if (!profilePath) return;

    await navigator.clipboard.writeText(profilePath);
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1800);
  };

  return (
    <Card className="rounded-2xl p-5 md:p-7">
      <div className="rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] p-5 md:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#dce4ff] bg-white text-blue-dark">
            <BiLink size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
              Interno dijeljenje
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-950">Podijeli profil</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Kopiraj ovaj link i pošalji ga u poruci unutar Duge. Link je interni i namijenjen je
              otvaranju profila samo u aplikaciji.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce4ff] bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
            Link za {profileLabel}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <code className="flex min-h-12 flex-1 items-center overflow-x-auto rounded-xl border border-[#dce4ff] bg-[#f7f9ff] px-4 py-3 text-sm font-semibold text-gray-800">
              {profilePath || 'Profil nije dostupan'}
            </code>
            <Button
              type="blue"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold shadow-md shadow-blue/15"
              onClick={handleCopy}
              disabled={!profilePath}
            >
              {hasCopied ? <BiCheck size={20} /> : <BiCopy size={20} />}
              {hasCopied ? 'Kopirano' : 'Kopiraj'}
            </Button>
          </div>
        </div>

        {profilePath && (
          <Link
            to={profilePath}
            className="mt-4 inline-flex rounded-full border border-[#dce4ff] bg-white px-5 py-3 text-sm font-semibold text-blue-dark shadow-sm transition-colors hover:bg-[#f0f4ff]"
          >
            Otvori interni link
          </Link>
        )}
      </div>
    </Card>
  );
};

export default ProfileSharePanel;
