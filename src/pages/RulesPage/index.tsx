import {
  BiCheckShield,
  BiErrorCircle,
  BiGroup,
  BiShieldQuarter,
  BiUserCheck,
} from 'react-icons/bi';

const navItems = [
  { href: '#dobna-granica', label: 'Dobna granica' },
  { href: '#ponasanje', label: 'Ponašanje' },
  { href: '#sadrzaj', label: 'Sadržaj' },
  { href: '#posljedice', label: 'Posljedice' },
  { href: '#prihvacanje', label: 'Prihvaćanje' },
];

const navLinkClassName =
  'inline-flex rounded-full border border-[#dce4ff] bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-blue hover:text-white';

const sectionClassName = 'rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm md:p-6';

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="mb-4 flex items-center gap-3">
    <div className="policy-section-icon grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
      {icon}
    </div>
    <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
  </div>
);

export default function TermsOfUsePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-gray-900">
      <header className="policy-header relative isolate mb-8 overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff] px-6 py-10 shadow-sm md:px-8">
        <div className="policy-header-glow absolute -left-16 top-8 h-44 w-44 rounded-full bg-blue/10 blur-3xl" />
        <div className="policy-header-glow absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-blue/10 blur-3xl" />

        <a
          href="/"
          className="policy-header-back relative z-10 mb-6 inline-flex rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-blue-dark shadow-sm transition-colors hover:bg-blue hover:text-white"
        >
          ← Povratak na početnu
        </a>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-white text-blue-dark shadow-lg shadow-blue/10">
            <BiCheckShield size={34} />
          </div>
          <span className="policy-header-label mb-3 inline-flex rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
            Duga pravila
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">Pravila upotrebe</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Posljednje ažuriranje: 25. svibnja 2026.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700">
            Dobrodošli na <strong>Duga</strong>. Korištenjem naše aplikacije prihvaćate ova Pravila
            upotrebe. Molimo vas da ih pažljivo pročitate.
          </p>
        </div>
      </header>

      <nav className="policy-section-nav sticky top-4 z-10 mb-8 rounded-3xl border border-[#dce4ff] bg-white/90 p-3 shadow-sm backdrop-blur">
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
        <section id="dobna-granica" className={sectionClassName}>
          <SectionHeader icon={<BiUserCheck size={24} />} title="Dobna granica" />
          <p className="leading-8 text-gray-700">
            Našu uslugu smiju koristiti isključivo osobe starije od 18 godina. Registracijom
            potvrđujete da ste punoljetni.
          </p>
        </section>

        <section id="ponasanje" className={sectionClassName}>
          <SectionHeader icon={<BiGroup size={24} />} title="Ponašanje korisnika" />
          <ul className="grid gap-3 text-gray-700">
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Zabranjeno je bilo kakvo nasilje, prijetnje i agresivno ponašanje.
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Zabranjeno je vrijeđanje, govor mržnje i diskriminacija bilo koje vrste.
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Korisnici moraju komunicirati pristojno i s poštovanjem.
            </li>
          </ul>
        </section>

        <section id="sadrzaj" className={sectionClassName}>
          <SectionHeader icon={<BiShieldQuarter size={24} />} title="Dopušteni sadržaj" />
          <ul className="grid gap-3 text-gray-700">
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Zabranjeno je dijeljenje eksplicitnog, pornografskog ili uvredljivog sadržaja.
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Sve fotografije i datoteke moraju biti pristojne i primjerene.
            </li>
            <li className="rounded-2xl bg-[#f7f9ff] px-4 py-3">
              Bilo kakav sadržaj koji krši ova pravila bit će uklonjen.
            </li>
          </ul>
        </section>

        <section id="posljedice" className={sectionClassName}>
          <SectionHeader icon={<BiErrorCircle size={24} />} title="Posljedice kršenja pravila" />
          <p className="leading-8 text-gray-700">
            Ako korisnik prekrši ova pravila, sadržaj može biti uklonjen bez prethodnog upozorenja.
            U slučaju težih ili ponovljenih kršenja, račun korisnika može biti trajno obrisan.
          </p>
        </section>

        <section id="prihvacanje" className={sectionClassName}>
          <SectionHeader icon={<BiCheckShield size={24} />} title="Prihvaćanje pravila" />
          <p className="leading-8 text-gray-700">
            Korištenjem <strong>Duga</strong> platforme potvrđujete da ste pročitali, razumjeli i
            prihvatili ova Pravila upotrebe.
          </p>
        </section>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Duga
      </footer>
    </main>
  );
}
