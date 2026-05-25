import {
  BiCookie,
  BiEnvelope,
  BiLockAlt,
  BiShieldQuarter,
  BiUserCheck,
  BiData,
} from 'react-icons/bi';

const navItems = [
  { href: '#voditelj-obrade', label: 'Voditelj obrade' },
  { href: '#podaci', label: 'Podaci' },
  { href: '#izvori', label: 'Izvori' },
  { href: '#svrhe', label: 'Svrhe i osnove' },
  { href: '#dijeljenje', label: 'Dijeljenje' },
  { href: '#pohrana', label: 'Pohrana' },
  { href: '#prava', label: 'Vaša prava' },
  { href: '#sigurnost', label: 'Sigurnost' },
  { href: '#djeca', label: 'Djeca' },
  { href: '#kolacici', label: 'Kolačići' },
  { href: '#promjene', label: 'Promjene' },
  { href: '#kontakt', label: 'Kontakt' },
];

const navLinkClassName =
  'inline-flex rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-blue hover:text-white';

const sectionClassName = 'rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm md:p-6';

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="mb-4 flex items-center gap-3">
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
      {icon}
    </div>
    <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-gray-900">
      <header className="relative isolate mb-8 overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff] px-6 py-10 shadow-sm md:px-8">
        <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-blue/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-pink/10 blur-3xl" />

        <a
          href="/"
          className="relative z-10 mb-6 inline-flex rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-blue-dark shadow-sm transition-colors hover:bg-blue hover:text-white"
        >
          ← Povratak na početnu
        </a>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-white text-blue-dark shadow-lg shadow-blue/10">
            <BiShieldQuarter size={34} />
          </div>
          <span className="mb-3 inline-flex rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
            Duga privatnost
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">Politika privatnosti</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Posljednje ažuriranje: 25. svibnja 2026.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700">
            Ova Politika objašnjava kako <strong>Duga</strong> prikuplja, koristi i štiti osobne
            podatke korisnika u skladu s Uredbom (EU) 2016/679 (GDPR) i važećim zakonima.
          </p>
        </div>
      </header>

      <nav className="sticky top-4 z-10 mb-8 rounded-3xl border border-[#dce4ff] bg-white/90 p-3 shadow-sm backdrop-blur">
        <ul className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={navLinkClassName}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        <section id="voditelj-obrade" className={sectionClassName}>
          <SectionHeader icon={<BiUserCheck size={24} />} title="Voditelj obrade" />
          <p className="leading-8 text-gray-700">
            Voditelj obrade je <strong>Duga</strong>. Službenika za zaštitu podataka, možete ga
            kontaktirati na{' '}
            <a href="mailto:admin@duga.chat" className="font-semibold text-blue hover:underline">
              admin@duga.chat
            </a>
            .
          </p>
        </section>

        <section id="podaci" className={sectionClassName}>
          <SectionHeader icon={<BiData size={24} />} title="Podaci koje prikupljamo" />
          <ul className="grid gap-3 text-gray-700 md:grid-cols-2">
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Ime, prezime, adresa e-pošte, korisnički račun.
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Podaci o prijavi i sigurnosti putem Auth0 (tokeni, IP adresa, user-agent).
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Podaci o korištenju aplikacije i preferencijama.
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Podaci o plaćanju ako je primjenjivo.
            </li>
          </ul>
        </section>

        <section id="izvori" className={sectionClassName}>
          <h2 className="mb-3 text-2xl font-bold text-gray-950">Izvori podataka</h2>
          <p className="leading-8 text-gray-700">
            Podatke prikupljamo izravno od vas prilikom registracije, korištenja aplikacije ili
            kontaktiranja podrške. Također koristimo Auth0 kao pružatelja autentifikacijskih usluga.
          </p>
        </section>

        <section id="svrhe" className={sectionClassName}>
          <h2 className="mb-3 text-2xl font-bold text-gray-950">Svrhe i pravne osnove</h2>
          <p className="leading-8 text-gray-700">
            Osobni podaci koriste se za omogućavanje prijave, pružanje usluge, poboljšanje
            funkcionalnosti, sigurnost i ispunjavanje zakonskih obveza. Pravne osnove uključuju
            izvršavanje ugovora, zakonitu obvezu, legitimni interes i privolu.
          </p>
        </section>

        <section id="dijeljenje" className={sectionClassName}>
          <h2 className="mb-3 text-2xl font-bold text-gray-950">Dijeljenje podataka</h2>
          <p className="leading-8 text-gray-700">
            Podaci se dijele s pružateljima usluga poput Auth0 (autentifikacija), procesora plaćanja
            i analitičkih alata, isključivo u svrhu pružanja i poboljšanja naših usluga.
          </p>
        </section>

        <section id="pohrana" className={sectionClassName}>
          <h2 className="mb-3 text-2xl font-bold text-gray-950">Razdoblje pohrane</h2>
          <p className="leading-8 text-gray-700">
            Podatke pohranjujemo samo onoliko dugo koliko je potrebno za svrhe u kojima su
            prikupljeni ili koliko to zahtijevaju zakoni.
          </p>
        </section>

        <section id="prava" className={sectionClassName}>
          <SectionHeader icon={<BiUserCheck size={24} />} title="Vaša prava" />
          <ul className="grid gap-3 text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Pravo na pristup podacima',
              'Pravo na ispravak i brisanje',
              'Pravo na ograničenje obrade',
              'Pravo na prenosivost podataka',
              'Pravo na prigovor',
              'Pravo na povlačenje privole',
            ].map((right) => (
              <li key={right} className="rounded-2xl bg-[#f7f9ff] px-4 py-3 font-medium">
                {right}
              </li>
            ))}
          </ul>
        </section>

        <section id="sigurnost" className={sectionClassName}>
          <SectionHeader icon={<BiLockAlt size={24} />} title="Sigurnost" />
          <p className="leading-8 text-gray-700">
            Poduzimamo tehničke i organizacijske mjere za zaštitu osobnih podataka od neovlaštenog
            pristupa, gubitka ili zlouporabe.
          </p>
        </section>

        <section id="djeca" className={sectionClassName}>
          <h2 className="mb-3 text-2xl font-bold text-gray-950">Djeca</h2>
          <p className="leading-8 text-gray-700">
            Naša usluga nije namijenjena osobama mlađim od 18 godina. Ne prikupljamo svjesno podatke
            djece.
          </p>
        </section>

        <section id="kolacici" className={sectionClassName}>
          <SectionHeader icon={<BiCookie size={24} />} title="Kolačići" />
          <p className="leading-8 text-gray-700">
            Koristimo kolačiće za nužne funkcionalnosti (uključujući Auth0), analitiku i
            preferencije. Više informacija nalazi se u našoj{' '}
            <a href="/cookie-policy" className="font-semibold text-blue hover:underline">
              Politici kolačića
            </a>
            .
          </p>
        </section>

        <section id="promjene" className={sectionClassName}>
          <h2 className="mb-3 text-2xl font-bold text-gray-950">Promjene politike</h2>
          <p className="leading-8 text-gray-700">
            Povremeno možemo ažurirati ovu Politiku. Datum zadnjeg ažuriranja uvijek je naveden na
            vrhu stranice.
          </p>
        </section>

        <section id="kontakt" className={sectionClassName}>
          <SectionHeader icon={<BiEnvelope size={24} />} title="Kontakt" />
          <p className="leading-8 text-gray-700">
            Ako imate pitanja o ovoj Politici ili obradi podataka, obratite nam se na{' '}
            <a href="mailto:admin@duga.chat" className="font-semibold text-blue hover:underline">
              admin@duga.chat
            </a>
            .
          </p>
        </section>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Duga
      </footer>
    </main>
  );
}
