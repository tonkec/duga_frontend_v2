import Card from '@app/components/Card';
import LatestUpload from './components/LatestUpload';
import { useGetLatestUploads } from './hooks';
import Button from '@app/components/Button';
import { useNavigate } from 'react-router';
import { BiImageAdd, BiImages, BiSolidCamera, BiUpload } from 'react-icons/bi';

interface IUpload {
  id: string;
  url: string;
  userId: string;
  securePhotoUrl: string;
}

const LatestUploads = () => {
  const navigate = useNavigate();
  const { latestUploads, isLatestUploadsLoading } = useGetLatestUploads();

  if (isLatestUploadsLoading) {
    return null;
  }

  if (!latestUploads?.data.length) {
    return (
      <section className="mt-8">
        <div className="mb-4">
          <p className="pl-0.5 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
            Zadnje fotografije
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Nedavno dodane fotke</h2>
        </div>

        <div className="relative isolate overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff] px-5 py-10 shadow-sm sm:px-8">
          <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-blue/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-blue/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-center">
            <div>
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-white text-blue-dark shadow-lg shadow-blue/10">
                <BiImageAdd size={34} />
              </div>
              <span className="mb-3 inline-flex rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
                Galerija
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Još nema dodanih fotografija
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                Fotografije daju profilu više osobnosti. Dodaj jednu jasnu sliku ili trenutak koji
                voliš i pomozi drugima da te lakše upoznaju.
              </p>

              <Button
                type="blue"
                className="mt-6 rounded-full px-6 py-3 font-semibold shadow-lg shadow-blue/20"
                onClick={() => navigate('/edit')}
              >
                Dodaj fotografije
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-[#e8eeff] bg-white/80 p-4 shadow-sm">
                <BiSolidCamera className="mb-3 text-blue" size={26} />
                <p className="text-sm font-bold text-gray-950">Profilna slika</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Prvi dojam počinje ovdje.</p>
              </div>
              <div className="mt-8 rounded-3xl border border-[#e8eeff] bg-white/80 p-4 shadow-sm">
                <BiUpload className="mb-3 text-blue" size={26} />
                <p className="text-sm font-bold text-gray-950">Tvoji trenuci</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Podijeli ono što voliš.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="pl-0.5 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
            Zadnje fotografije
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Nedavno dodane fotke</h2>
          <p className="mt-1 text-sm text-gray-600">
            Pogledaj najnovije trenutke koje su korisnici podijelili.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-blue-dark shadow-sm">
          <BiImages />
          {latestUploads.data.length} novih
        </span>
      </div>

      <Card className="!rounded-3xl !bg-gradient-to-br !from-white !via-[#fbfcff] !to-[#f7f9ff] p-4 md:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestUploads?.data.map((upload: IUpload) => (
            <LatestUpload key={upload.id} upload={upload} />
          ))}
        </div>
      </Card>
    </section>
  );
};

export default LatestUploads;
