import AppLayout from '@app/components/AppLayout';
import { Link } from 'react-router';
import { BiArrowBack, BiHomeAlt, BiMap } from 'react-icons/bi';

const NotFoundPage = () => {
  return (
    <AppLayout>
      <section className="relative isolate mx-auto flex min-h-[calc(100vh-18rem)] max-w-2xl items-center justify-center overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#eef3ff] px-6 py-12 text-center shadow-sm">
        <div className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-60 w-60 rounded-full bg-pink/10 blur-3xl" />

        <div className="relative z-10 flex max-w-lg flex-col items-center">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-white text-blue shadow-lg shadow-blue/10">
            <BiMap size={42} />
          </div>
          <span className="mb-4 rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">
            404
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Ova stranica ne postoji.
          </h1>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Link možda više nije aktivan ili je adresa pogrešno upisana. Vrati se na početnu ili
            prethodnu stranicu.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue/15 transition-colors hover:bg-blue-dark"
            >
              <BiHomeAlt size={20} />
              Natrag na početnu
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dce4ff] bg-white px-6 py-3 text-sm font-semibold text-blue shadow-sm transition-colors hover:bg-[#f0f4ff]"
            >
              <BiArrowBack size={20} />
              Prethodna stranica
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default NotFoundPage;
