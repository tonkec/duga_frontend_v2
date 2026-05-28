import AppLayout from '@app/components/AppLayout';
import { Link } from 'react-router';
import { BiArrowBack, BiFileBlank, BiHomeAlt, BiImage, BiRefresh } from 'react-icons/bi';

const RecordNotFound = () => {
  return (
    <AppLayout>
      <section className="relative isolate mx-auto flex min-h-[calc(100vh-18rem)] max-w-3xl items-center justify-center overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#eef3ff] px-6 py-12 text-center shadow-sm">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-blue/10 blur-3xl" />

        <div className="relative z-10 flex max-w-xl flex-col items-center">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-white text-blue shadow-lg shadow-blue/10">
            <BiFileBlank size={42} />
          </div>

          <span className="mb-4 inline-flex rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">
            Nije pronađeno
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Ova fotografija više nije dostupna.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-600">
            Link možda vodi na obrisanu fotografiju, privatnu datoteku ili zapis koji se još nije
            uspio učitati. Pokušaj ponovno ili se vrati na galeriju.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue/15 transition-colors hover:bg-blue-dark"
            >
              <BiRefresh size={20} />
              Pokušaj ponovno
            </button>
            <Link
              to="/profile?tab=all-photos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dce4ff] bg-white px-6 py-3 text-sm font-semibold text-blue shadow-sm transition-colors hover:bg-[#f0f4ff]"
            >
              <BiImage size={20} />
              Moje fotografije
            </Link>
          </div>

          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dce4ff] bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-[#f0f4ff]"
            >
              <BiArrowBack size={18} />
              Prethodna stranica
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dce4ff] bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-[#f0f4ff]"
            >
              <BiHomeAlt size={18} />
              Početna
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default RecordNotFound;
