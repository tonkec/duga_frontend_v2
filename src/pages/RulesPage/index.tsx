export default function TermsOfUsePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pravila upotrebe</h1>
        <p className="text-sm text-gray-500">Posljednje ažuriranje: 16. kolovoza 2025.</p>
        <p className="mt-4">
          Dobrodošli na <strong>Duga</strong>. Korištenjem naše aplikacije prihvaćate ova Pravila
          upotrebe. Molimo vas da ih pažljivo pročitate.
        </p>
      </header>

      <section id="dobna-granica" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Dobna granica</h2>
        <p>
          Našu uslugu smiju koristiti isključivo osobe starije od 18 godina. Registracijom
          potvrđujete da ste punoljetni.
        </p>
      </section>

      <section id="ponasanje" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Ponašanje korisnika</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Zabranjeno je bilo kakvo nasilje, prijetnje i agresivno ponašanje.</li>
          <li>Zabranjeno je vrijeđanje, govor mržnje i diskriminacija bilo koje vrste.</li>
          <li>Korisnici moraju komunicirati pristojno i s poštovanjem.</li>
        </ul>
      </section>

      <section id="sadrzaj" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Dopušteni sadržaj</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Zabranjeno je dijeljenje eksplicitnog, pornografskog ili uvredljivog sadržaja.</li>
          <li>Sve fotografije i datoteke moraju biti pristojne i primjerene.</li>
          <li>Bilo kakav sadržaj koji krši ova pravila bit će uklonjen.</li>
        </ul>
      </section>

      <section id="posljedice" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Posljedice kršenja pravila</h2>
        <p>
          Ako korisnik prekrši ova pravila, sadržaj može biti uklonjen bez prethodnog upozorenja. U
          slučaju težih ili ponovljenih kršenja, račun korisnika može biti trajno obrisan.
        </p>
      </section>

      <section id="prihvacanje" className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Prihvaćanje pravila</h2>
        <p>
          Korištenjem <strong>Duga</strong> platforme potvrđujete da ste pročitali, razumjeli i
          prihvatili ova Pravila upotrebe.
        </p>
      </section>

      <footer className="text-sm text-gray-500 mt-16">© {new Date().getFullYear()} Duga</footer>
    </main>
  );
}
