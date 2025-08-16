import Button from '@app/components/Button';
import { useAuth0 } from '@auth0/auth0-react';
import Guy from '@app/assets/guy.svg';
import Girl from '@app/assets/girl.svg';
import AI from '@app/assets/ai.svg';
import CookieBanner from '@app/components/CookieBanner';
import { BiHeart, BiStopwatch, BiMessage, BiSolidCircle } from 'react-icons/bi';
import { useRef } from 'react';
import Image from '@app/components/Image';
import { Link } from 'react-router';

const getDomainPath = () => {
  const { hostname } = window.location;
  if (hostname.includes('duga.app')) {
    return 'https://duga.app';
  } else if (hostname.includes('staging--dugaprod.netlify.app')) {
    return 'https://staging--dugaprod.netlify.app';
  } else {
    return 'http://localhost:5173';
  }
};

const URL = getDomainPath();

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();
  const learnMoreRef = useRef<HTMLDivElement>(null);

  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="gradient">
        <CookieBanner />
        <nav className="transparent py-6 px-4 flex justify-between items-center fixed top-0 left-0 w-full z-10">
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

        <div className="flex py-52 px-8 items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="mt-2 text-8xl font-bold text-white">Duga</h1>
            <p className="text-center mt-8 text-white text-4xl max-w-xl">
              Razgovaraj, flertaj ili prozuji s queer osobicama s Balkana.
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
                Prijavi se!
              </Button>

              <Button
                type="blue"
                className="!px-6 !py-4 !text-xl w-full sm:w-auto"
                onClick={scrollToLearnMore}
              >
                Saznaj više
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-16 px-12" ref={learnMoreRef}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-center text-4xl font-bold">Kako funkcionira Duga?</h1>

          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 mt-8">
            <div className="bg-blue text-center rounded-lg px-6 py-8 flex-1">
              <BiHeart className="text-white inline-block mb-6" fontSize={40} color="#F037A5" />
              <h4 className="text-white text-xl mb-2">Pronadi zanimljivu osobicu</h4>
              <p className="text-white">Pregledaj profile i pronađi nekoga tko ti se sviđa.</p>
            </div>

            <div className="bg-blue-dark text-center rounded-lg px-6 py-8 flex-1">
              <BiStopwatch className="text-white inline-block mb-6" fontSize={40} color="#F037A5" />
              <h4 className="text-white text-xl mb-2">Uštedi si vrijeme i živčeke</h4>
              <p className="text-white">
                Iskoristi naše filtere za brzo pronalaženje idealne osobice.
              </p>
            </div>

            <div className="bg-blue text-center rounded-lg px-6 py-8 flex-1">
              <BiMessage className="text-white inline-block mb-6" fontSize={40} color="#F037A5" />
              <h4 className="text-white text-xl mb-2">Pošalji poruku</h4>
              <p className="text-white">
                Pošalji poruku osobi koja ti se sviđa i započni razgovor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 pb-32 px-12">
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
      </section>

      <section className="bg-white px-12">
        <div className="flex flex-col sm:flex-row items-center gap-6">
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
      </section>

      <section className="gradient text-center pt-12 overflow-hidden px-12">
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
      </section>

      <section className="bg-white px-12 pt-12">
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
      </section>

      <section className="py-32 bg-blue text-white">
        <div className="mx-auto p-4">
          <div className="flex mx-auto max-w-5xl gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-5xl mb-6"> Tražimo contributore! </h2>
              <p className="text-lg">
                Duga je open source aplikacija bazirana na <b>React</b> tehnologijama. U potrazi smo
                za novim članovima_cama tima. Ako si zainteresiran_a za rad na ovom projektu,
                slobodno se javi našem adminu{' '}
                <a className="underline" href="mailto:admin@duga.app">
                  admin@duga.app{' '}
                </a>
              </p>
            </div>

            <div className="w-1/2 hidden lg:block">
              <Image src={Girl} alt="AI" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="bg-gray-800 text-white py-8">
          <div className="flex justify-center items-center gap-2">
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
    </>
  );
};

export default LoginPage;
