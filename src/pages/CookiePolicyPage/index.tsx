export default function CookiePolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-black">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Politika kolačića</h1>
        <p className="text-sm text-gray-500">Posljednje ažuriranje: 16. kolovoza 2025.</p>
        <p className="mt-4">
          Ova politika objašnjava kako <strong>Duga</strong> koristi kolačiće i slične tehnologije.
        </p>
      </header>

      <nav className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-10">
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <a
              href="#sto-su-kolacici"
              className="px-3 py-1 border rounded-full hover:bg-gray-100 text-black hover:text-black"
            >
              Što su kolačići
            </a>
          </li>
          <li>
            <a
              href="#vrste-kolacica"
              className="px-3 py-1 border rounded-full hover:bg-gray-100 text-black hover:text-black"
            >
              Vrste kolačića
            </a>
          </li>
          <li>
            <a
              href="#trece-strane"
              className="px-3 py-1 border rounded-full hover:bg-gray-100 text-black hover:text-black"
            >
              Kolačići trećih strana
            </a>
          </li>
          <li>
            <a
              href="#upravljanje"
              className="px-3 py-1 border rounded-full hover:bg-gray-100 text-black hover:text-black"
            >
              Upravljanje
            </a>
          </li>
          <li>
            <a
              href="#promjene"
              className="px-3 py-1 border rounded-full hover:bg-gray-100 text-black hover:text-black"
            >
              Promjene
            </a>
          </li>
          <li>
            <a
              href="#kontakt"
              className="px-3 py-1 border rounded-full hover:bg-gray-100 text-black hover:text-black"
            >
              Kontakt
            </a>
          </li>
        </ul>
      </nav>

      <section id="sto-su-kolacici" className="mb-10 text-black">
        <h2 className="text-2xl font-semibold mb-3">Što su kolačići?</h2>
        <p>
          Kolačići su male tekstualne datoteke koje se spremaju na vaš uređaj kada posjetite web
          stranicu. Omogućuju prepoznavanje preglednika, čuvanje postavki i poboljšanje sigurnosti i
          funkcionalnosti.
        </p>
      </section>

      <section id="vrste-kolacica" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Koje vrste kolačića koristimo?</h2>

        <details open className="mb-4 bg-gray-50  border border-gray-200 rounded-xl p-4">
          <summary className="cursor-pointer font-medium">
            1) Nužni (obvezni) kolačići{' '}
            <span className="ml-2 text-xs border px-2 py-0.5 rounded-full">Obvezno</span>
          </summary>
          <div className="mt-3 space-y-3">
            <p>
              Ovi kolačići su ključni za rad naše aplikacije i ne mogu se isključiti. Bez njih
              prijava, sigurnost i pružanje usluge možda neće raditi ispravno.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Naziv</th>
                    <th className="p-2 border">Pružatelj</th>
                    <th className="p-2 border">Svrha</th>
                    <th className="p-2 border">Vrsta</th>
                    <th className="p-2 border">Trajanje</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">(Auth0 nužni kolačići)</td>
                    <td className="p-2 border">Auth0</td>
                    <td className="p-2 border">
                      Sigurna autentifikacija, održavanje sesije, zaštita od zloupotrebe.
                    </td>
                    <td className="p-2 border">HTTP kolačić</td>
                    <td className="p-2 border">Sjednica</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">(Duga-session)</td>
                    <td className="p-2 border">Duga</td>
                    <td className="p-2 border">Održavanje prijave i stanja korisnika.</td>
                    <td className="p-2 border">HTTP kolačić</td>
                    <td className="p-2 border">Sjednica</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <details className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <summary className="cursor-pointer font-medium">2) Preferencijski kolačići</summary>
          <p className="mt-3">
            Pamte vaše postavke (npr. jezik, način prikaza) kako bi iskustvo bilo personalizirano.
          </p>
        </details>

        <details className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <summary className="cursor-pointer font-medium">3) Analitički kolačići</summary>
          <p className="mt-3">
            Pomažu nam razumjeti kako se aplikacija koristi (npr. broj posjeta, najposjećenije
            stranice) kako bismo je poboljšali.
          </p>
        </details>

        <details className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <summary className="cursor-pointer font-medium">4) Marketinški/oglasni kolačići</summary>
          <p className="mt-3">
            Služe za personalizaciju oglasa i mjerenje učinkovitosti kampanja. Postavljaju ih mi ili
            naši partneri.
          </p>
        </details>
      </section>

      <section id="trece-strane" className="mb-10 text-black">
        <h2 className="text-2xl font-semibold mb-3 text-black">Kolačići trećih strana</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Auth0</strong> – za autentifikaciju i sigurnost.
          </li>
          <li>
            <em>(Opcionalno)</em> Google Analytics, Stripe ili drugi alati koje koristimo.
          </li>
        </ul>
      </section>

      <section id="promjene" className="mb-10 text-black">
        <h2 className="text-2xl font-semibold mb-3">Promjene ove politike</h2>
        <p>
          Možemo povremeno ažurirati ovu politiku radi usklađivanja s promjenama u tehnologiji,
          zakonodavstvu ili našim uslugama.
        </p>
      </section>

      <section id="kontakt" className="mb-10 text-black">
        <h2 className="text-2xl font-semibold mb-3">Kontakt</h2>
        <p>
          Ako imate pitanja o ovoj politici, kontaktirajte nas na:{' '}
          <a href="mailto:admin@duga.chat" className="text-blue-600 hover:underline">
            admin@duga.chat
          </a>
        </p>
      </section>

      <footer className="text-sm text-gray-500 mt-16">© {new Date().getFullYear()} Duga</footer>
    </main>
  );
}
