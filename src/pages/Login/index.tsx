import Button from '@app/components/Button';
import { useAuth0 } from '@auth0/auth0-react';
import Guy from '@app/assets/guy.svg';
import Girl from '@app/assets/girl.svg';
import AI from '@app/assets/ai.svg';
import Love1 from '@app/assets/love1.svg';
import { FaEnvelopesBulk, FaPeopleGroup, FaPhotoFilm } from 'react-icons/fa6';
import CookieBanner from '@app/components/CookieBanner';
import { BiHeart, BiStopwatch, BiMessage, BiSolidCircle } from 'react-icons/bi';
import { useRef } from 'react';
import Image from '@app/components/Image';
import { Link } from 'react-router';
import FadeInSection from '@app/components/FadeIn';
import Accordion from './components/Accordion';
import { clearAppSessionRevoked } from '@app/api/appSession';

const howItWorksItems = [
  {
    icon: BiHeart,
    title: 'Pronađi osobu koja ti paše',
    text: 'Pregledaj profile, interese i fotke bez pritiska.',
  },
  {
    icon: BiStopwatch,
    title: 'Filtriraj bez gubljenja vremena',
    text: 'Brže dođi do ljudi iz svoje regije, grada ili faze života.',
  },
  {
    icon: BiMessage,
    title: 'Započni siguran razgovor',
    text: 'Pošalji poruku kada osjetiš klik i nastavi svojim tempom.',
  },
];

const reasonItems = [
  {
    number: '01',
    title: 'Queer prostor za Balkan',
    text: 'Duga je napravljena za ljude koji žele razgovor bez objašnjavanja tko su.',
  },
  {
    number: '02',
    title: 'Privatnost pod tvojom kontrolom',
    text: 'Ti biraš što dijeliš, s kim razgovaraš i kada želiš nestati iz aplikacije.',
  },
  {
    number: '03',
    title: 'Manje buke, više stvarnih poruka',
    text: 'Jednostavan profil, chat i fotke stavljaju fokus na upoznavanje, ne na beskonačno skrolanje.',
  },
];

const statItems = [
  {
    icon: FaPeopleGroup,
    value: '500+',
    title: 'korisnika_ca',
    text: 'Ljudi iz regije već pronalaze razgovore, podršku, prijateljstva i flert.',
  },
  {
    icon: FaEnvelopesBulk,
    value: '10k+',
    title: 'poruka',
    text: 'Chat je brz, jednostavan i napravljen za upoznavanje bez nepotrebnih komplikacija.',
  },
  {
    icon: FaPhotoFilm,
    value: '1000+',
    title: 'fotki',
    text: 'Dodaj profilne fotke i albume kada želiš pokazati malo više sebe.',
  },
];

const forumItems = [
  {
    value: 'Pitanja',
    title: 'Postavi pitanje zajednici',
    text: 'Otvori temu kad trebaš savjet, iskustvo ili samo prostor za razgovor.',
  },
  {
    value: 'Odgovori',
    title: 'Dobij konkretne odgovore',
    text: 'Članovi_ce mogu odgovoriti, dodati slike i pomoći iz vlastitog iskustva.',
  },
  {
    value: 'Glasovi',
    title: 'Najkorisnije ispliva gore',
    text: 'Glasanje i prihvaćeni odgovori pomažu da se brzo nađe najkorisniji odgovor.',
  },
];

const priceFeatures = [
  'Kreiranje profila',
  'Pretraživanje profila',
  'Neograničene poruke',
  'Do ukupno 5 fotografija',
];

const faqItems = [
  {
    question: 'Mogu li izbrisati svoj profil kad god poželim?',
    answer: 'Da, profil možeš izbrisati u bilo kojem trenutku putem postavki računa.',
  },
  {
    question: 'Kako funkcionira registracija na Dugu?',
    answer:
      'Registracija je brza i jednostavna, potrebno je samo unijeti osnovne podatke i potvrditi adresu e-pošte.',
  },
  {
    question: 'Moram li imati profilnu sliku da bih koristio aplikaciju?',
    answer:
      'Ne, ali preporučujemo dodavanje profilne slike jer povećava povjerenje i šanse za povezivanje s drugim korisnicima.',
  },
  {
    question: 'Na kojim jezicima je dostupna Duga?',
    answer:
      'Trenutno podržavamo hrvatski jezik, a planiramo dodati i druge balkanske jezike u budućnosti.',
  },
  {
    question: 'Kako mogu postati contributor ili pomoći u razvoju?',
    answer:
      'Možeš se uključiti putem našeg GitHub repozitorija ili nam se javiti direktno putem e-pošte.',
  },
  {
    question: 'Mogu li prijaviti bug ili dati prijedlog za nove funkcionalnosti?',
    answer:
      'Naravno! Svaka povratna informacija nam je dragocjena. Možeš nam pisati putem obrasca za kontakt ili GitHuba.',
  },
  {
    question: 'Postoji li minimalna dob za registraciju?',
    answer: 'Da, minimalna dob za registraciju je 18 godina, radi sigurnosti i zaštite korisnika.',
  },
];

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();
  const learnMoreRef = useRef<HTMLDivElement>(null);

  const onLogin = () => {
    clearAppSessionRevoked();
    loginWithRedirect({
      appState: {
        returnTo: '/post-login',
      },
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
  };

  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page bg-[#f7f8ff] text-gray-900">
      <header className="gradient relative overflow-hidden">
        <CookieBanner />
        <nav className="fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between bg-blue-dark/85 px-5 py-4 shadow-lg shadow-blue-dark/10 backdrop-blur-md md:bg-blue-dark/20 md:px-8">
          <Link to="/" className="text-2xl font-black tracking-tight text-white">
            Duga
          </Link>
          <Button
            className="landing-nav-login-action !rounded-full !px-5 font-semibold shadow-lg"
            type="primary"
            onClick={onLogin}
          >
            Prijavi se
          </Button>
        </nav>

        <div className="container relative mx-auto px-5 pb-24 pt-32 md:px-8 lg:pb-32 lg:pt-40">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/90 shadow-lg backdrop-blur">
                Queer upoznavanje za Balkan
              </p>
              <h1 className="text-6xl font-black leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
                Duga
              </h1>
              <p className="mt-8 max-w-2xl text-3xl font-semibold leading-tight text-white md:text-5xl">
                Upoznaj queer osobe iz regije bez buke, pritiska i čudnih vibra.
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
                Razgovaraj, flertaj ili pronađi ekipu koja razumije tvoj kontekst. Profil, fotke i
                poruke su jednostavni, a sigurnost je ugrađena od prvog klika.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button
                  type="primary"
                  className="landing-hero-primary-action w-full !rounded-full !px-7 !py-4 !text-lg font-bold shadow-xl sm:w-auto"
                  onClick={onLogin}
                >
                  Prijavi se
                </Button>

                <Button
                  type="tertiary"
                  className="landing-hero-secondary-action w-full !rounded-full !bg-white/95 !px-7 !py-4 !text-lg font-bold shadow-xl hover:!bg-[#f0f4ff] sm:w-auto"
                  onClick={scrollToLearnMore}
                >
                  Saznaj više
                </Button>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 text-white">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-2xl font-black">18+</p>
                  <p className="text-sm text-white/80">samo odrasli</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-xl font-black">
                    <span className="sm:hidden">Free</span>
                    <span className="hidden sm:inline">Besplatno</span>
                  </p>
                  <p className="text-sm text-white/80">osnovni plan</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-2xl font-black">AI</p>
                  <p className="text-sm text-white/80">sigurnost</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto hidden max-w-xl lg:block">
              <div className="absolute -left-8 top-10 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute -right-8 bottom-8 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur">
                <Image src={Love1} alt="Dvije osobe sjede zajedno" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <FadeInSection>
        <section className="landing-how-section bg-white px-5 py-20 md:px-8" ref={learnMoreRef}>
          <div className="container mx-auto">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue">Kako radi</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-blue-dark md:text-5xl">
                Upoznavanje bez kompliciranja
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Sve što trebaš je profil, par interesa i poruka kada netko zapne za oko.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {howItWorksItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="landing-info-card rounded-[1.75rem] border border-blue/10 bg-[#f7f8ff] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="landing-info-card-icon mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/10 text-blue">
                      <Icon fontSize={34} />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-dark">{item.title}</h3>
                    <p className="mt-3 leading-7 text-gray-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="landing-reasons-section px-5 py-20 md:px-8">
          <div className="container mx-auto grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue">Zašto Duga</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-blue-dark md:text-5xl">
                Manje dating aplikacija, više zajednice.
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Fokus je na jasnom profilu, sigurnom chatu i ljudima koji traže stvarnu povezanost.
              </p>
            </div>

            <div className="space-y-5">
              {reasonItems.map((item) => (
                <div
                  key={item.number}
                  className="landing-info-card group rounded-[1.75rem] border border-blue/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:p-8"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <span className="text-5xl font-black leading-none text-blue/80">
                      {item.number}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-dark">{item.title}</h3>
                      <p className="mt-3 text-lg leading-8 text-gray-600">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="landing-forum-section bg-white px-5 py-20 md:px-8">
          <div className="container mx-auto grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue">Forum</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-blue-dark md:text-5xl">
                Pitaj zajednicu prije nego zapneš sam_a
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Forum je mjesto za pitanja, preporuke, tehničke probleme i razgovore koji trebaju
                više prostora od chata. Odgovori se mogu glasati, prihvatiti i lakše pronaći
                kasnije.
              </p>
              <Button
                type="blue"
                className="landing-primary-action mt-8 !rounded-full !px-6 !py-3 !text-lg font-bold"
                onClick={onLogin}
              >
                Pridruži se forumu
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {forumItems.map((item) => (
                <div
                  key={item.value}
                  className="landing-info-card rounded-[1.5rem] border border-blue/10 bg-[#f7f9ff] p-6 shadow-sm"
                >
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-blue">
                    {item.value}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-blue-dark">{item.title}</h3>
                  <p className="mt-3 leading-7 text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="px-5 py-20 md:px-8">
          <div className="landing-stats-panel container mx-auto overflow-hidden rounded-[2rem] bg-[#f7f9ff] p-6 shadow-sm md:p-10 lg:p-14">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue">Zajednica</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-blue-dark md:text-5xl">
                Duga u brojkama
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-700">
                Mali proizvod, ali već dovoljno živ da se svaki novi profil osjeti.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {statItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="landing-info-card rounded-[1.5rem] bg-white p-7 shadow-sm"
                  >
                    <Icon className="text-blue" fontSize="2.2rem" />
                    <p className="mt-6 text-5xl font-black text-blue-dark">{item.value}</p>
                    <h3 className="mt-2 text-2xl font-bold text-blue-dark">{item.title}</h3>
                    <p className="mt-4 leading-7 text-gray-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="landing-safety-section bg-white px-5 py-20 md:px-8">
          <div className="container mx-auto grid items-center gap-10 lg:grid-cols-2">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue">Sigurnost</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-blue-dark md:text-5xl">
                AI pomaže održati prostor ugodnim
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Duga koristi alate za prepoznavanje neprimjerenog sadržaja, spama i prijava. Ljudi
                ostaju u centru, a tehnologija pomaže da razgovori budu mirniji.
              </p>
              <Button
                type="blue"
                className="landing-primary-action mt-8 !rounded-full !px-6 !py-3 !text-lg font-bold"
                onClick={() => {
                  window.open('https://aws.amazon.com/rekognition/', '_blank');
                }}
              >
                Saznaj više
              </Button>
            </div>
            <div className="landing-illustration-card rounded-[2rem] bg-[#f7f8ff] p-8 shadow-sm">
              <Image src={AI} alt="AI sigurnost" className="w-full h-auto" />
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="gradient overflow-hidden px-5 pt-16 md:px-8">
          <div className="container mx-auto grid items-end gap-8 lg:grid-cols-[0.65fr_1fr]">
            <div className="-mb-16 hidden lg:block">
              {<Image src={Guy} alt="Osoba s mobitelom" className="block h-auto w-full" />}
            </div>
            <div className="max-w-2xl py-16 text-white">
              <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                Pridruži nam se danas
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/85">
                Kreiraj profil, pronađi osobe koje ti odgovaraju i započni razgovor kada budeš
                spreman_na.
              </p>
              <Button
                type="primary"
                className="mt-8 !rounded-full !px-7 !py-4 !text-lg font-bold shadow-xl"
                onClick={onLogin}
              >
                Prijavi se
              </Button>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="landing-pricing-section px-5 py-20 md:px-8">
          <div className="container mx-auto grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue">Cijena</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-blue-dark md:text-5xl">
                Kreni besplatno
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                Osnovne funkcionalnosti su dostupne odmah. Premium opcija je još u izgradnji.
              </p>
            </div>

            <div className="landing-pricing-card max-w-xl rounded-[2rem] bg-white p-7 shadow-xl ring-1 ring-blue/10 md:p-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-blue-dark">Besplatni plan</h3>
                  <p className="mt-2 text-gray-600">Sve što trebaš za početak upoznavanja.</p>
                </div>
                <p className="rounded-full bg-blue/10 px-4 py-2 text-xl font-black text-blue">
                  <span className="sm:hidden">Free</span>
                  <span className="hidden sm:inline">Besplatno</span>
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {priceFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-lg text-gray-700">
                    <BiSolidCircle className="text-blue" fontSize={10} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                type="primary"
                className="mt-10 w-full !rounded-full !px-6 !py-4 !text-lg font-bold"
                onClick={onLogin}
              >
                Odaberi plan u aplikaciji
              </Button>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="landing-faq-section bg-white px-5 py-20 md:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue">FAQ</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-blue-dark md:text-5xl">
                Česta pitanja
              </h2>
            </div>

            <div className="landing-faq-panel rounded-[2rem] border border-blue/10 bg-[#f7f8ff] p-5 shadow-sm md:p-8">
              <Accordion items={faqItems} />
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="bg-blue px-5 py-20 text-white md:px-8">
          <div className="container mx-auto grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">
                Open source
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                Tražimo contributore!
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/85">
                Duga je open source aplikacija bazirana na <b>React</b> tehnologijama. U potrazi smo
                za novim članovima_cama tima. Ako želiš raditi na projektu, javi se na{' '}
                <a className="font-bold underline" href="mailto:admin@duga.chat">
                  admin@duga.chat
                </a>
                .
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/10 p-6">
              <Image src={Girl} alt="Contributor ilustracija" className="w-full h-auto" />
            </div>
          </div>
        </section>
      </FadeInSection>

      <footer className="bg-gray-900 px-5 py-8 text-white md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-center font-semibold">Duga © {new Date().getFullYear()}</p>
            <div className="flex flex-col items-center gap-3 text-sm md:flex-row md:gap-6">
              <Link to="/cookie-policy" className="text-white/80 underline hover:text-white">
                Politika kolačića
              </Link>
              <Link to="/privacy-policy" className="text-white/80 underline hover:text-white">
                Politika privatnosti
              </Link>
              <Link to="/terms-of-use" className="text-white/80 underline hover:text-white">
                Uvjeti korištenja
              </Link>
            </div>
            <p className="text-center text-sm text-white/60">Sva prava pridržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
