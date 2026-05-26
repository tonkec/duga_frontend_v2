import { Link } from 'react-router';
import { BiHomeAlt, BiRefresh, BiWifiOff } from 'react-icons/bi';

const NetworkErrorPage = () => {
  return (
    <div className="gradient relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-blue/10 blur-3xl" />

      <section className="network-error-card relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-6 text-center text-gray-950 shadow-2xl shadow-blue-dark/20 backdrop-blur-md sm:p-8">
        <div className="network-error-icon mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-blue/10 text-blue shadow-lg shadow-blue/10">
          <BiWifiOff size={42} />
        </div>

        <span className="network-error-badge mb-4 inline-flex rounded-full bg-red/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red">
          Server nije dostupan
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Izgleda da se server srušio.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-600">
          Ne možemo trenutno dohvatiti podatke. Pokušaj ponovno za nekoliko trenutaka ili se vrati
          na početnu stranicu.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="network-error-retry inline-flex items-center justify-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue/20 transition-colors hover:bg-blue-dark"
          >
            <BiRefresh size={20} />
            Pokušaj ponovno
          </button>
          <Link
            to="/"
            className="network-error-home inline-flex items-center justify-center gap-2 rounded-full border border-[#dce4ff] bg-white px-6 py-3 text-sm font-semibold text-blue shadow-sm transition-colors hover:bg-[#f0f4ff]"
          >
            <BiHomeAlt size={20} />
            Natrag na početnu
          </Link>
        </div>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {['Provjeri internet vezu', 'Pričekaj kratko', 'Osvježi stranicu'].map((item) => (
            <div
              key={item}
              className="network-error-tip rounded-2xl bg-[#f7f9ff] px-4 py-3 text-sm font-semibold text-gray-700"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NetworkErrorPage;
