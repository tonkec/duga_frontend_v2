import { BiCookie, BiEnvelope, BiLockAlt, BiShieldQuarter, BiSlider } from 'react-icons/bi';

const navItems = [
  { href: '#sto-su-kolacici', label: 'Što su kolačići' },
  { href: '#vrste-kolacica', label: 'Vrste kolačića' },
  { href: '#trece-strane', label: 'Treće strane' },
  { href: '#upravljanje', label: 'Upravljanje' },
  { href: '#promjene', label: 'Promjene' },
  { href: '#kontakt', label: 'Kontakt' },
];

const navLinkClassName =
  'inline-flex rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-blue hover:text-white';

const sectionClassName = 'rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm md:p-6';

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-gray-900">
      <header className="relative isolate mb-8 overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff] px-6 py-10 shadow-sm md:px-8">
        <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-blue/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-blue/10 blur-3xl" />

        <a
          href="/"
          className="relative z-10 mb-6 inline-flex rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-blue-dark shadow-sm transition-colors hover:bg-blue hover:text-white"
        >
          ← Povratak na početnu
        </a>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-white text-blue-dark shadow-lg shadow-blue/10">
            <BiCookie size={34} />
          </div>
          <span className="mb-3 inline-flex rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
            Duga pravila
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">Politika kolačića</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Posljednje ažuriranje: 25. svibnja 2026.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700">
            Ova politika objašnjava kako <strong>Duga</strong> koristi kolačiće i slične tehnologije
            za prijavu, sigurnost, postavke i poboljšanje usluge.
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
        <section id="sto-su-kolacici" className={sectionClassName}>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
              <BiCookie size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-950">Što su kolačići?</h2>
          </div>
          <p className="leading-8 text-gray-700">
            Kolačići su male tekstualne datoteke koje se spremaju na vaš uređaj kada posjetite web
            stranicu. Omogućuju prepoznavanje preglednika, čuvanje postavki i poboljšanje sigurnosti
            i funkcionalnosti.
          </p>
        </section>

        <section id="vrste-kolacica" className={sectionClassName}>
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
              <BiSlider size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-950">Koje vrste kolačića koristimo?</h2>
          </div>

          <details open className="mb-4 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
            <summary className="cursor-pointer font-semibold text-gray-950">
              1) Nužni (obvezni) kolačići{' '}
              <span className="ml-2 rounded-full border border-blue/20 bg-white px-2 py-0.5 text-xs text-blue-dark">
                Obvezno
              </span>
            </summary>
            <div className="mt-4 space-y-4">
              <p className="leading-7 text-gray-700">
                Ovi kolačići su ključni za rad naše aplikacije i ne mogu se isključiti. Bez njih
                prijava, sigurnost i pružanje usluge možda neće raditi ispravno.
              </p>
              <div className="overflow-x-auto rounded-2xl border border-[#dce4ff] bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#eef3ff] text-gray-700">
                    <tr>
                      <th className="p-3 font-semibold">Naziv</th>
                      <th className="p-3 font-semibold">Pružatelj</th>
                      <th className="p-3 font-semibold">Svrha</th>
                      <th className="p-3 font-semibold">Vrsta</th>
                      <th className="p-3 font-semibold">Trajanje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eeff] text-gray-700">
                    <tr>
                      <td className="p-3 font-medium text-gray-900">(Auth0 nužni kolačići)</td>
                      <td className="p-3">Auth0</td>
                      <td className="p-3">
                        Sigurna autentifikacija, održavanje sesije, zaštita od zloupotrebe.
                      </td>
                      <td className="p-3">HTTP kolačić</td>
                      <td className="p-3">Sjednica</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-gray-900">(Duga-session)</td>
                      <td className="p-3">Duga</td>
                      <td className="p-3">Održavanje prijave i stanja korisnika.</td>
                      <td className="p-3">HTTP kolačić</td>
                      <td className="p-3">Sjednica</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <details className="mb-4 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
            <summary className="cursor-pointer font-semibold text-gray-950">
              2) Preferencijski kolačići
            </summary>
            <p className="mt-3 leading-7 text-gray-700">
              Pamte vaše postavke (npr. jezik, način prikaza) kako bi iskustvo bilo personalizirano.
            </p>
          </details>

          <details className="mb-4 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
            <summary className="cursor-pointer font-semibold text-gray-950">
              3) Analitički kolačići
            </summary>
            <p className="mt-3 leading-7 text-gray-700">
              Pomažu nam razumjeti kako se aplikacija koristi (npr. broj posjeta, najposjećenije
              stranice) kako bismo je poboljšali.
            </p>
          </details>

          <details className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
            <summary className="cursor-pointer font-semibold text-gray-950">
              4) Marketinški/oglasni kolačići
            </summary>
            <p className="mt-3 leading-7 text-gray-700">
              Služe za personalizaciju oglasa i mjerenje učinkovitosti kampanja. Postavljaju ih mi
              ili naši partneri.
            </p>
          </details>
        </section>

        <section id="trece-strane" className={sectionClassName}>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
              <BiShieldQuarter size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-950">Kolačići trećih strana</h2>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              <strong>Auth0</strong> – za autentifikaciju i sigurnost.
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              <em>(Opcionalno)</em> Google Analytics, Stripe ili drugi alati koje koristimo.
            </li>
          </ul>
        </section>

        <section id="upravljanje" className={sectionClassName}>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
              <BiLockAlt size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-950">Upravljanje kolačićima</h2>
          </div>
          <p className="leading-8 text-gray-700">
            Nužni kolačići potrebni su za rad aplikacije. Ostale kolačiće možete ograničiti kroz
            postavke preglednika ili postavke aplikacije kada su dostupne.
          </p>
        </section>

        <section id="promjene" className={sectionClassName}>
          <h2 className="mb-3 text-2xl font-bold text-gray-950">Promjene ove politike</h2>
          <p className="leading-8 text-gray-700">
            Možemo povremeno ažurirati ovu politiku radi usklađivanja s promjenama u tehnologiji,
            zakonodavstvu ili našim uslugama.
          </p>
        </section>

        <section id="kontakt" className={sectionClassName}>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
              <BiEnvelope size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-950">Kontakt</h2>
          </div>
          <p className="leading-8 text-gray-700">
            Ako imate pitanja o ovoj politici, kontaktirajte nas na:{' '}
            <a href="mailto:admin@duga.chat" className="font-semibold text-blue hover:underline">
              admin@duga.chat
            </a>
          </p>
        </section>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Duga
      </footer>
    </main>
  );
}
