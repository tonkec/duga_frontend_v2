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

const getDomainPath = () => {
  const { hostname } = window.location;
  if (hostname.includes('duga.app')) {
    return 'https://duga.app/';
  } else if (hostname.includes('staging--dugaprod.netlify.app')) {
    return 'https://staging--dugaprod.netlify.app';
  } else {
    return 'http://localhost:5173';
  }
};

const URL = getDomainPath();

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
    question: 'Kako mogu nadograditi na premium plan?',
    answer: 'Jednostavno iz postavki računa odaberi premium plan i slijedi upute za plaćanje.',
  },
  {
    question: 'Mogu li otkazati pretplatu u bilo kojem trenutku?',
    answer:
      'Da, pretplatu možeš otkazati kad god želiš u postavkama računa, bez dodatnih troškova.',
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

  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white">
      <header className="gradient  pb-32">
        <CookieBanner />
        <nav className="transparent py-6 px-8 flex justify-between items-center fixed top-0 left-0 w-full z-10">
          <Button
            className=""
            type="primary"
            onClick={() => {
              loginWithRedirect({
                authorizationParams: {
                  redirect_uri: URL,
                },
              });
            }}
          >
            Prijava
          </Button>
        </nav>

        <div className="container relative mx-auto">
          <div className="lg:flex pt-52 items-center">
            <div className="flex flex-col md:bg-blue pt-6 pb-8 rounded px-8">
              <h1 className="mt-2 mb-12 text-8xl font-bold text-white">Duga</h1>
              <p className="mt-8 text-white text-4xl max-w-xl">
                Razgovaraj, flertaj ili prozuji s <b className="font-bold">queer</b> osobicama s
                Balkana.
              </p>
              <div className="flex flex-col sm:flex-row items-center mt-8 gap-4">
                <Button
                  type="primary"
                  className="!px-6 !py-4 !text-xl w-full sm:w-auto"
                  onClick={() => {
                    loginWithRedirect({
                      authorizationParams: {
                        redirect_uri: URL,
                      },
                    });
                  }}
                >
                  Prijavi se! 👉
                </Button>

                <Button
                  type="tertiary"
                  className="!px-6 !py-4 !text-xl w-full sm:w-auto"
                  onClick={scrollToLearnMore}
                >
                  Saznaj više 👇
                </Button>
              </div>
            </div>

            <div className="flex flex-col max-w-lg items-center mx-auto lg:absolute lg:inline-block hidden -bottom-[13rem] right-8 ob">
              <Image src={Love1} alt="Love" className="w-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="pt-24">
        <FadeInSection>
          <div className="bg-white pt-24 lg:pt-24 pb-12 px-12" ref={learnMoreRef}>
            <div className="container mx-auto">
              <h1 className="text-center text-4xl font-bold">Kako funkcionira Duga?</h1>

              <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 mt-8">
                <div className="bg-blue text-center rounded-lg px-6 py-8 flex-1">
                  <BiHeart className="text-white inline-block mb-6" fontSize={40} color="#F037A5" />
                  <h4 className="text-white text-xl mb-2">Pronadi zanimljivu osobicu</h4>
                  <p className="text-white">Pregledaj profile i pronađi nekoga tko ti se sviđa.</p>
                </div>

                <div className="bg-blue-dark text-center rounded-lg px-6 py-8 flex-1">
                  <BiStopwatch
                    className="text-white inline-block mb-6"
                    fontSize={40}
                    color="#F037A5"
                  />
                  <h4 className="text-white text-xl mb-2">Uštedi si vrijeme i živčeke</h4>
                  <p className="text-white">
                    Iskoristi naše filtere za brzo pronalaženje idealne osobice.
                  </p>
                </div>

                <div className="bg-blue text-center rounded-lg px-6 py-8 flex-1">
                  <BiMessage
                    className="text-white inline-block mb-6"
                    fontSize={40}
                    color="#F037A5"
                  />
                  <h4 className="text-white text-xl mb-2">Pošalji poruku</h4>
                  <p className="text-white">
                    Pošalji poruku osobi koja ti se sviđa i započni razgovor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>

      <FadeInSection>
        <div className="bg-white py-16 pb-12 px-12">
          <h2 className="text-center text-4xl font-bold mb-8">Zašto odabrati baš nas?</h2>
          <ul className="max-w-2xl mx-auto">
            <li className="bg-blue-dark py-8 px-6 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div>
                  <span className="text-6xl text-white">01.</span>
                </div>
                <div>
                  <h4 className="text-xl text-white">
                    Jednostavno i brzo povezivanje s queer osobama.
                  </h4>
                  <p className="text-white text-md mt-4">
                    Naša platforma omogućava ti da se lako povežeš s osobama koje dijele slične
                    interese i vrijednosti.
                  </p>
                </div>
              </div>
            </li>
            <li className="gradient py-8 px-6 mt-2 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div>
                  <span className="text-6xl text-white">02.</span>
                </div>
                <div>
                  <h4 className="text-xl text-white">Sigurnost i privatnost su na prvom mjestu.</h4>
                  <p className="text-white text-md mt-4">
                    Osiguravamo zaštitu tvojih podataka i potpunu kontrolu nad svojim profilom.
                  </p>
                </div>
              </div>
            </li>

            <li className="bg-blue-dark py-8 px-6 rounded-lg mt-2">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div>
                  <span className="text-6xl text-white">03.</span>
                </div>
                <div>
                  <h4 className="text-xl text-white">
                    Raznolike mogućnosti za komunikaciju i upoznavanje.
                  </h4>
                  <p className="text-white text-md mt-4">
                    Nudimo različite načine za povezivanje s drugim korisnicima, uključujući chat,
                    video pozive i grupne razgovore.
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div className="text-center py-24 mb-32 mt-32 overflow-hidden px-12 bg-rose container mx-auto rounded">
          <h2 className="text-center text-4xl font-bold mb-24">Duga u brojkama i iskustvu</h2>

          <div className="lg:grid lg:grid-cols-3 gap-6 xl:gap-12">
            <div className="space-y-2 mb-12 lg:mb-0">
              <div className="flex items-center gap-2">
                <FaPeopleGroup className="text-[#2D46B9]" fontSize="2rem" />
                <h2 className="text-4xl">Mnogo korisnika</h2>
              </div>
              <p className="text-left text-gray-700">
                Na Dugi već 500+ korisnika iz cijele regije upoznaje nove prijatelje, partnere ili
                jednostavno pronalazi podršku. Svakog tjedna nam se pridružuju novi korisnici iz
                cijele regije – studenti, mladi profesionalci, kreativci i svi oni koji žele
                autentične razgovore. Duga je sigurno mjesto gdje možeš biti svoj i povezati se s
                ljudima koji razumiju tvoju priču. Bez pritiska, bez predrasuda – samo iskrena
                povezanost.
              </p>
            </div>

            <div className="space-y-2 mb-12 lg:mb-0">
              <div className="flex items-center gap-2 ">
                <FaEnvelopesBulk className="text-[#2D46B9]" fontSize="2rem" />
                <h2 className="text-4xl">Gro poruka</h2>
              </div>
              <p className="text-left text-gray-700">
                Već je razmijenjeno 10.000+ poruka. Naša chat platforma omogućuje ti da brzo i
                jednostavno razmjenjuješ poruke. Bilo da tražiš lagani razgovor, flert ili ozbiljnu
                vezu – komunikacija je brza, sigurna i uvijek pod tvojom kontrolom. Uz AI nadzor i
                alate za prijavu, možeš biti siguran da je razgovor ugodan i zaštićen od neželjenog
                sadržaja. Razmjenjuj misli, planiraj susrete ili jednostavno dijeli svakodnevne
                trenutke – sve na jednom mjestu.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FaPhotoFilm className="text-[#2D46B9]" fontSize="2rem" />
                <h2 className="text-4xl">Hrpetina fotki</h2>
              </div>
              <p className="text-left text-gray-700">
                Podijeli svoje najbolje trenutke s drugima – od profilnih fotki do albuma. Na Dugi
                je već podijeljeno više od 1000 fotografija – pokaži i ti svoju jedinstvenost!
                Dodavanjem fotografija stvaraš bolji dojam, povećavaš šanse za povezivanje i daješ
                drugima priliku da te upoznaju. Tvoje fotografije su uvijek pod tvojom kontrolom –
                odlučuješ što i kada želiš podijeliti.
              </p>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div className="bg-white px-8">
          <div className="flex pb-12 lg:pb-0 flex-col md:flex-row items-center gap-6 container mx-auto">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-6">AI nadgleda sigurnost sadržaja</h2>
              <p className="text-lg mb-8">
                Naša platforma koristi napredne AI alate za prepoznavanje i uklanjanje neprimjerenog
                sadržaja. Bilo da se radi o uvredama, spam porukama ili bilo kojem obliku
                zlostavljanja, naš AI sustav će ga prepoznati i ukloniti. Na taj način osiguravamo
                sigurno i ugodno okruženje za sve naše korisnike i korisnice.
              </p>
              <Button
                type="primary"
                className="!px-4 !py-2 !text-lg"
                onClick={() => {
                  window.open('https://aws.amazon.com/rekognition/', '_blank');
                }}
              >
                Saznaj više
              </Button>
            </div>
            <div>
              <Image src={AI} alt="AI" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div className="gradient text-center pt-12 overflow-hidden px-12">
          <div className="flex items-end justify-center">
            <div className="sm:w-1/4 -mb-4 -ml-24 transparent hidden lg:block">
              {<Image src={Guy} alt="Guy" className="w-full h-auto" />}
            </div>
            <div className="flex flex-col text-left pb-6">
              <h3 className="text-4xl text-white font-bold mb-4">Pridruži nam se danas!</h3>
              <p className="text-white mb-8">
                Iskoristi sve prednosti naše platforme i pronađi svoju srodnu dušu.
                <br />
                Postani član naše zajednice. Zaljubi se u trenu i pronađi ljubav svog života.
              </p>
              <Button
                type="primary"
                className="!px-6 !py-4 !text-xl max-w-md"
                onClick={() => {
                  loginWithRedirect({
                    authorizationParams: {
                      redirect_uri: URL,
                    },
                  });
                }}
              >
                Prijavi se
              </Button>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div className="bg-white px-8 pt-12">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-6">Cijena</h2>

            <p className="text-lg max-w-2xl">
              Naša platforma nudi različite planove pretplate kako bi zadovoljila potrebe svih
              korisnika. Od besplatnog osnovnog plana do premium opcija, imamo nešto za svakoga.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 mt-12">
              <div className="bg-pink p-6 rounded-lg">
                <h3 className="text-2xl font-bold mt-2 mb-4 text-white">Besplatni plan</h3>
                <h3 className="text-lg text-white mb-12">0€ mjesečno</h3>

                <ul>
                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-blue" fontSize={10} />
                    <span className="text-white text-lg">Osnovne funkcionalnosti</span>
                  </li>
                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-blue" fontSize={10} />
                    <span className="text-white text-lg">Mogućnost kreiranja profila</span>
                  </li>
                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-blue" fontSize={10} />
                    <span className="text-white text-lg">Mogućnost pretraživanja profila</span>
                  </li>
                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-blue" fontSize={10} />
                    <span className="text-white text-lg">Neograničene poruke</span>
                  </li>

                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-blue" fontSize={10} />
                    <span className="text-white text-lg">Do ukupno 5 fotografija</span>
                  </li>

                  <li className="mt-12">
                    <Button
                      type="transparent"
                      className="!px-6 !py-2 !text-lg no-underline !bg-pink-dark text-white"
                      onClick={() => {
                        loginWithRedirect({
                          authorizationParams: {
                            redirect_uri: URL,
                          },
                        });
                      }}
                    >
                      Odaberi plan unutar aplikacije
                    </Button>
                  </li>
                </ul>
              </div>

              <div className="gradient p-6 rounded-lg">
                <h3 className="text-2xl font-bold mt-2 mb-4 text-white">Premium plan</h3>
                <h3 className="text-lg text-white mb-12">10€ mjesečno</h3>

                <ul>
                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-pink" fontSize={10} />
                    <span className="text-white text-lg">Sve značajke osnovnog plana</span>
                  </li>

                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-pink" fontSize={10} />
                    <span className="text-white text-lg">Saznaj tko ti gleda profil</span>
                  </li>
                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-pink" fontSize={10} />
                    <span className="text-white text-lg">Saznaj jesu li vidjeli poruku</span>
                  </li>
                  <li className="text-md text-black mb-3">
                    <BiSolidCircle className="inline-block mr-2 text-pink" fontSize={10} />
                    <span className="text-white text-lg">Grupni razgovori </span>
                  </li>

                  <li className="text-md text-black">
                    <BiSolidCircle className="inline-block mr-2 text-pink" fontSize={10} />
                    <span className="text-white text-lg">Do ukupno 10 fotografija</span>
                  </li>

                  <li className="mt-12">
                    <Button
                      type="blue"
                      className="!px-6 !py-2 !text-lg"
                      onClick={() => {
                        loginWithRedirect({
                          authorizationParams: {
                            redirect_uri: URL,
                          },
                        });
                      }}
                    >
                      Odaberi plan unutar aplikacije
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection>
        <div className="container mx-auto pt-24 pb-24 px-8">
          <h2 className="text-3xl font-bold mb-6">FAQ</h2>

          <Accordion items={faqItems} />
        </div>
      </FadeInSection>

      <FadeInSection>
        <div className="py-32 bg-blue text-white">
          <div className="mx-auto container p-4">
            <div className="flex flex-col md:flex-row mx-auto gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-5xl mb-6"> Tražimo contributore! </h2>
                <p className="text-lg">
                  Duga je open source aplikacija bazirana na <b>React</b> tehnologijama. U potrazi
                  smo za novim članovima_cama tima. Ako si zainteresiran_a za rad na ovom projektu,
                  slobodno se javi našem adminu{' '}
                  <a className="underline" href="mailto:admin@duga.app">
                    admin@duga.app{' '}
                  </a>
                </p>
              </div>

              <div className="md:w-1/2">
                <Image src={Girl} alt="AI" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      <footer>
        <div className="bg-gray-800 text-white py-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-2">
            <div>
              <Link to="/cookie-policy" className="text-white underline">
                Politika kolačića
              </Link>
            </div>
            <div>
              <Link to="/privacy-policy" className="text-white underline">
                Politika privatnosti
              </Link>
            </div>
            <div>
              <Link to="/terms-of-use" className="text-white underline">
                Uvjeti korištenja
              </Link>
            </div>
          </div>
          <div className="max-w-7xl mx-auto p-4 flex justify-center gap-2">
            <p className="text-center">Duga © {new Date().getFullYear()}</p>
            <p className="text-center">Sva prava pridržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
