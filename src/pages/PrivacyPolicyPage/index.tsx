export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Politika privatnosti</h1>
        <p className="text-sm text-gray-500">Posljednje ažuriranje: 16. kolovoza 2025.</p>
        <p className="mt-4">
          Ova Politika objašnjava kako <strong>Duga</strong> prikuplja, koristi i štiti osobne
          podatke korisnika u skladu s Uredbom (EU) 2016/679 (GDPR) i važećim zakonima.
        </p>
      </header>

      <nav className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-10">
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <a href="#voditelj-obrade" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Voditelj obrade
            </a>
          </li>
          <li>
            <a href="#podaci" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Podaci koje prikupljamo
            </a>
          </li>
          <li>
            <a href="#izvori" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Izvori
            </a>
          </li>
          <li>
            <a href="#svrhe" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Svrhe i osnove
            </a>
          </li>
          <li>
            <a href="#dijeljenje" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Dijeljenje
            </a>
          </li>
          <li>
            <a href="#pohrana" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Pohrana
            </a>
          </li>
          <li>
            <a href="#prava" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Vaša prava
            </a>
          </li>
          <li>
            <a href="#sigurnost" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Sigurnost
            </a>
          </li>
          <li>
            <a href="#djeca" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Djeca
            </a>
          </li>
          <li>
            <a href="#kolacici" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Kolačići
            </a>
          </li>
          <li>
            <a href="#promjene" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Promjene
            </a>
          </li>
          <li>
            <a href="#kontakt" className="px-3 py-1 border rounded-full hover:bg-gray-100">
              Kontakt
            </a>
          </li>
        </ul>
      </nav>

      <section id="voditelj-obrade" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Voditelj obrade</h2>
        <p>
          Voditelj obrade je <strong>Duga</strong>. Službenika za zaštitu podataka, možete ga
          kontaktirati na{' '}
          <a href="mailto:admin@duga.chat" className="text-blue-600 hover:underline">
            admin@duga.chat
          </a>
          .
        </p>
      </section>

      <section id="podaci" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Podaci koje prikupljamo</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Ime, prezime, adresa e-pošte, korisnički račun.</li>
          <li>Podaci o prijavi i sigurnosti putem Auth0 (tokeni, IP adresa, user-agent).</li>
          <li>Podaci o korištenju aplikacije i preferencijama.</li>
          <li>Podaci o plaćanju ako je primjenjivo.</li>
        </ul>
      </section>

      <section id="izvori" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Izvori podataka</h2>
        <p>
          Podatke prikupljamo izravno od vas prilikom registracije, korištenja aplikacije ili
          kontaktiranja podrške. Također koristimo Auth0 kao pružatelja autentifikacijskih usluga.
        </p>
      </section>

      <section id="svrhe" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Svrhe i pravne osnove</h2>
        <p>
          Osobni podaci koriste se za omogućavanje prijave, pružanje usluge, poboljšanje
          funkcionalnosti, sigurnost i ispunjavanje zakonskih obveza. Pravne osnove uključuju
          izvršavanje ugovora, zakonitu obvezu, legitimni interes i privolu.
        </p>
      </section>

      <section id="dijeljenje" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Dijeljenje podataka</h2>
        <p>
          Podaci se dijele s pružateljima usluga poput Auth0 (autentifikacija), procesora plaćanja i
          analitičkih alata, isključivo u svrhu pružanja i poboljšanja naših usluga.
        </p>
      </section>

      <section id="pohrana" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Razdoblje pohrane</h2>
        <p>
          Podatke pohranjujemo samo onoliko dugo koliko je potrebno za svrhe u kojima su prikupljeni
          ili koliko to zahtijevaju zakoni.
        </p>
      </section>

      <section id="prava" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Vaša prava</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Pravo na pristup podacima</li>
          <li>Pravo na ispravak i brisanje</li>
          <li>Pravo na ograničenje obrade</li>
          <li>Pravo na prenosivost podataka</li>
          <li>Pravo na prigovor</li>
          <li>Pravo na povlačenje privole</li>
        </ul>
      </section>

      <section id="sigurnost" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Sigurnost</h2>
        <p>
          Poduzimamo tehničke i organizacijske mjere za zaštitu osobnih podataka od neovlaštenog
          pristupa, gubitka ili zlouporabe.
        </p>
      </section>

      <section id="djeca" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Djeca</h2>
        <p>
          Naša usluga nije namijenjena osobama mlađim od 18 godina. Ne prikupljamo svjesno podatke
          djece.
        </p>
      </section>

      <section id="kolacici" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Kolačići</h2>
        <p>
          Koristimo kolačiće za nužne funkcionalnosti (uključujući Auth0), analitiku i preferencije.
          Više informacija nalazi se u našoj{' '}
          <a href="/cookie-policy" className="text-blue-600 hover:underline">
            Politici kolačića
          </a>
          .
        </p>
      </section>

      <section id="promjene" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Promjene politike</h2>
        <p>
          Povremeno možemo ažurirati ovu Politiku. Datum zadnjeg ažuriranja uvijek je naveden na
          vrhu stranice.
        </p>
      </section>

      <section id="kontakt" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Kontakt</h2>
        <p>
          Ako imate pitanja o ovoj Politici ili obradi podataka, obratite nam se na{' '}
          <a href="mailto:admin@duga.chat" className="text-blue-600 hover:underline">
            admin@duga.chat
          </a>
          .
        </p>
      </section>

      <footer className="text-sm text-gray-500 mt-16">© {new Date().getFullYear()} Duga</footer>
    </main>
  );
}
