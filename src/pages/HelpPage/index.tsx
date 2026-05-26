import AppLayout from '@app/components/AppLayout';
import Button from '@app/components/Button';
import { Link, useNavigate } from 'react-router-dom';
import {
  BiEnvelope,
  BiFlag,
  BiGroup,
  BiHelpCircle,
  BiImage,
  BiLockAlt,
  BiShieldQuarter,
  BiUserCheck,
} from 'react-icons/bi';

const quickLinks = [
  { href: '#kako-koristiti', label: 'Kako koristiti' },
  { href: '#featurei', label: 'Featurei' },
  { href: '#problemi', label: 'Problemi i kontakt' },
  { href: '#grupni-chatovi', label: 'Grupni chatovi' },
  { href: '#sigurnost', label: 'Sigurnost' },
  { href: '#ai-slike', label: 'AI provjera slika' },
];

const helpCardClassName = 'rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm md:p-6';
const navLinkClassName =
  'inline-flex rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:border-blue hover:text-blue';

const SectionHeader = ({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) => (
  <div className="mb-4 flex items-start gap-3">
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] text-blue-dark">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">{label}</p>
      <h2 className="mt-1 text-2xl font-bold text-gray-950">{title}</h2>
    </div>
  </div>
);

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-3xl border border-[#dce4ff] bg-white px-5 py-9 shadow-sm sm:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] text-blue-dark shadow-lg shadow-blue/10">
              <BiHelpCircle size={34} />
            </div>
            <span className="mb-3 inline-flex rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
              Duga pomoć
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-950">
              Sve bitno o korištenju Duge
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700">
              Duga je siguran prostor za upoznavanje, razgovor, dijeljenje fotografija i pitanja
              zajednici. Ovdje su najvažnije upute, kontakti i pravila ponašanja.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                type="blue"
                className="rounded-full px-6 py-3 font-semibold shadow-md shadow-blue/15"
                onClick={() => navigate('/report')}
              >
                Prijavi problem
              </Button>
              <a
                href="mailto:admin@duga.chat"
                className="inline-flex items-center justify-center rounded-full border border-[#dce4ff] bg-white px-6 py-3 text-sm font-semibold text-blue-dark shadow-sm transition-colors hover:bg-[#f0f4ff]"
              >
                Piši podršci
              </a>
            </div>
          </div>
        </header>

        <nav className="sticky top-4 z-10 mb-8 rounded-3xl border border-[#dce4ff] bg-white p-3 shadow-sm">
          <ul className="flex flex-wrap gap-2">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={navLinkClassName}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          <section id="kako-koristiti" className={helpCardClassName}>
            <SectionHeader
              icon={<BiUserCheck size={24} />}
              label="Prvi koraci"
              title="Kako koristiti aplikaciju"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Uredi profil, dodaj jasnu profilnu fotografiju i napiši kratak opis o sebi.',
                'Pregledaj korisnike i otvori profil osobe koju želiš bolje upoznati.',
                'Pošalji poruku ili otvori novi razgovor iz sekcije Poruke.',
                'Koristi forum za pitanja, preporuke i razgovore koji mogu pomoći cijeloj zajednici.',
              ].map((tip) => (
                <p key={tip} className="rounded-2xl bg-[#f7f9ff] px-4 py-3 leading-7 text-gray-700">
                  {tip}
                </p>
              ))}
            </div>
          </section>

          <section id="featurei" className={helpCardClassName}>
            <SectionHeader
              icon={<BiHelpCircle size={24} />}
              label="Mogućnosti"
              title="Osnovni featurei koje Duga ima"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Korisnički profili',
                  description:
                    'Uredi svoj profil, dodaj opis, lokaciju, fotografije i profilnu sliku.',
                },
                {
                  title: 'Pregled korisnika',
                  description:
                    'Pronađi verificirane korisnike i otvori profile osoba koje želiš upoznati.',
                },
                {
                  title: 'Privatne poruke',
                  description:
                    'Započni razgovor 1 na 1, šalji tekst, emoji reakcije i fotografije.',
                },
                {
                  title: 'Grupni chatovi',
                  description:
                    'Kreiraj grupu, dodaj više osoba i vodi zajednički razgovor s admin pravima.',
                },
                {
                  title: 'Forum zajednice',
                  description:
                    'Postavi pitanje, odgovori drugima, dodaj slike i sudjeluj u raspravama.',
                },
                {
                  title: 'Fotografije i komentari',
                  description:
                    'Objavljuj fotografije, označi profilnu sliku, komentiraj i reagiraj na objave.',
                },
                {
                  title: 'Obavijesti',
                  description:
                    'Prati nove poruke, reakcije, komentare i druge bitne aktivnosti u aplikaciji.',
                },
                {
                  title: 'Sigurnosne prijave',
                  description:
                    'Prijavi bug, neprimjeren sadržaj, uznemiravanje ili problem s računom.',
                },
                {
                  title: 'AI provjera slika',
                  description:
                    'Slike u porukama prolaze automatsku provjeru radi sigurnijeg iskustva.',
                },
              ].map((feature) => (
                <article key={feature.title} className="rounded-2xl bg-[#f7f9ff] px-4 py-4">
                  <h3 className="font-bold text-gray-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="problemi" className={helpCardClassName}>
            <SectionHeader
              icon={<BiFlag size={24} />}
              label="Podrška"
              title="Kome se javiti ako bude problema"
            />
            <p className="leading-8 text-gray-700">
              Ako primijetiš bug, problem s računom, neprimjeren sadržaj, uznemiravanje ili bilo
              kakvu sumnjivu aktivnost, pošalji prijavu administratorima putem stranice{' '}
              <Link to="/report" className="font-semibold text-blue hover:underline">
                Prijavi problem
              </Link>
              . Za dodatna pitanja možeš pisati i na{' '}
              <a href="mailto:admin@duga.chat" className="font-semibold text-blue hover:underline">
                admin@duga.chat
              </a>
              .
            </p>
          </section>

          <section id="grupni-chatovi" className={helpCardClassName}>
            <SectionHeader
              icon={<BiGroup size={24} />}
              label="Razgovori"
              title="Admin privilegije u grupnim chatovima"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl bg-[#f7f9ff] px-4 py-4">
                <h3 className="font-bold text-gray-950">Tko je admin?</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Osoba koja kreira grupni razgovor postaje admin grupe.
                </p>
              </article>
              <article className="rounded-2xl bg-[#f7f9ff] px-4 py-4">
                <h3 className="font-bold text-gray-950">Što admin može?</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Admin može dodavati nove članove i uklanjati osobe iz grupnog razgovora.
                </p>
              </article>
              <article className="rounded-2xl bg-[#f7f9ff] px-4 py-4">
                <h3 className="font-bold text-gray-950">Kad admin izađe</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Ako admin napusti grupu, admin prava se prenose na sljedećeg člana grupe.
                </p>
              </article>
            </div>
            <p className="mt-4 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] px-4 py-3 text-sm font-semibold leading-6 text-gray-700">
              Kad se nova osoba doda u grupu, može vidjeti povijest razgovora, zato dodaj samo osobe
              kojima vjeruješ i koje trebaju biti dio razgovora.
            </p>
          </section>

          <section id="sigurnost" className={helpCardClassName}>
            <SectionHeader
              icon={<BiShieldQuarter size={24} />}
              label="Zaštita"
              title="Aplikacija je sigurna"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <p className="rounded-2xl bg-[#f7f9ff] px-4 py-4 leading-7 text-gray-700">
                Duga koristi sigurnu prijavu, prikazuje verificirane korisnike i omogućuje brzu
                prijavu problema administratorima.
              </p>
              <p className="rounded-2xl bg-[#f7f9ff] px-4 py-4 leading-7 text-gray-700">
                Tvoje prijave i sigurnosni problemi se pregledavaju kako bi zajednica ostala ugodna,
                korisna i zaštićena od zlouporabe.
              </p>
              <p className="rounded-2xl bg-[#f7f9ff] px-4 py-4 leading-7 text-gray-700 md:col-span-2">
                Slike su zaštićene sa svih strana: prolaze provjere prije objave, dohvaćaju se kroz
                sigurne linkove i mogu se odmah prijaviti ako nešto izgleda sumnjivo ili
                neprimjereno.
              </p>
            </div>
          </section>

          <section id="ai-slike" className={helpCardClassName}>
            <SectionHeader
              icon={<BiImage size={24} />}
              label="AI provjera"
              title="Kako AI prati i provjerava slike"
            />
            <p className="leading-8 text-gray-700">
              Slike koje se šalju u porukama prolaze automatsku AI provjeru prije objave. Sustav
              provjerava osnovne sigurnosne kriterije, poput toga sadrži li fotografija lice i ima
              li eksplicitnog ili neprimjerenog sadržaja. Ako slika ne prođe provjeru, neće biti
              poslana i prikazat će se razlog odbijanja.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <p className="rounded-2xl bg-[#f7f9ff] px-4 py-3 text-sm leading-6 text-gray-600">
                AI pomaže brzo prepoznati rizične slike, ali korisnici i dalje mogu prijaviti sve
                što izgleda sumnjivo ili neprimjereno.
              </p>
              <p className="rounded-2xl bg-[#f7f9ff] px-4 py-3 text-sm leading-6 text-gray-600">
                Administratorima se možeš javiti kroz prijavu problema ako misliš da je slika
                pogrešno blokirana ili da je nešto prošlo provjeru.
              </p>
              <p className="rounded-2xl bg-[#f7f9ff] px-4 py-3 text-sm leading-6 text-gray-600 md:col-span-2">
                Zaštita slika nije samo jedna provjera: kombiniramo automatsku analizu, ograničenja
                formata i veličine, sigurnu pohranu te mogućnost ručne prijave administratorima.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-blue/20 bg-blue px-5 py-6 text-white shadow-lg shadow-blue/15 md:px-6">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-white/80">
                  <BiLockAlt size={22} />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Trebaš pomoć?
                  </span>
                </div>
                <h2 className="text-2xl font-bold">
                  Pošalji prijavu ili se javi administratorima.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                  Najbrži put za bugove, sigurnosne probleme i neprimjeren sadržaj je obrazac za
                  prijavu problema.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue shadow-md shadow-blue-dark/10 transition-colors hover:bg-[#f0f4ff]"
                >
                  <BiFlag size={20} />
                  Prijavi problem
                </Link>
                <a
                  href="mailto:admin@duga.chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <BiEnvelope size={20} />
                  admin@duga.chat
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
