import Button from '../../components/Button';
import { useAuth0 } from '@auth0/auth0-react';
import Image1 from '../../assets/image1.png';
import Image2 from '../../assets/image2.png';
import Image3 from '../../assets/image3.png';
import Image4 from '../../assets/image4.png';
import Homepage from '../../assets/homepage.svg';

const IS_STAGING = import.meta.env.STAGING;
const URL = IS_STAGING ? 'https://dugastaging.netlify.app' : 'http://localhost:5173';

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <header className="gradient">
        <nav className="gradient py-2 px-4 flex justify-between items-center fixed top-0 left-0 w-full z-10">
          <h1 className="text-white">Duga 🏳️‍🌈</h1>
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
            Prijavi se!
          </Button>
        </nav>

        <div className="flex py-36 px-8 mt-14 items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-8xl font-bold mt-4 text-white">Duga</h1>
            <p className="text-center mt-8 text-white">
              Dejting aplikacija namijenjena LGBT osobama na Balkanu.
            </p>
            <Button
              type="primary"
              className="mt-4"
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
          </div>
        </div>
      </header>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-center text-4xl font-bold">Kako funkcionira Duga?</h1>
          <p className="text-center">Jednostavno i učinkovito!</p>

          <section className="bg-gray-100 py-16">
            <div className="max-w-7xl mx-auto p-4">
              <div className="lg:flex items-center mx-auto">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mt-4">1. Potrudi se oko svog profila ✍️ </h2>
                  <p className="mt-2 max-w-md">
                    Profil je prva stvar koju korisnici vide kada se prijave. Stoga je važno da
                    profil bude ispunjen sa što više informacija o tebi. Dodajte svoje slike, opis,
                    interese i sve ostale informacije koje smatrate relevantnima.
                  </p>
                </div>

                <div className="flex-1">
                  <img src={Image2} alt="Potrudi se oko svog profila" className="rounded-sm mt-8" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-100 py-16">
            <div className="max-w-7xl mx-auto p-4">
              <div className="lg:flex items-center mx-auto">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mt-4">2. Pokaži se na fotkama 📸</h2>
                  <p className="mt-2 max-w-md">
                    Tvoje fotke su itekako bitne jer korisnici na temelju njih donose odluku hoće li
                    ti poslati poruku ili ne. Stoga je važno da imaš što više fotki na profilu.
                    Fotke trebaju biti kvalitetne i jasne, a najbolje je da su fotke na kojima si
                    nasmijan_a i opušten_a. Fotke nisu obavezne.
                  </p>
                </div>

                <div className="flex-1">
                  <img src={Image3} alt="Pokaži se na fotkama" className="rounded-sm mt-8" />
                </div>
              </div>
            </div>
          </section>

          <div className="lg:flex items-center mx-auto">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mt-4">3. Pretraži korisnike 🔍</h2>
              <p className="mt-2 max-w-md">
                Svi korisnici su izlistani prijavljenim userima. Kada se prijaviš, možeš vidjeti
                profile drugih korisnika te ih zapratiti. Ne vjerujemo u brzinsko svajpanje i
                robotsko spajanje ljudi na temelju plitkih pitanja. Tako da je potrebno zaista pomno
                proučiti profile korisnika.
              </p>
            </div>

            <div className="flex-1">
              <img src={Image1} alt="Pretraži korisnike" className="rounded-sm mt-8" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto p-4">
          <div className="lg:flex items-center mx-auto">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mt-4">4. Pošalji poruku ✉️</h2>
              <p className="mt-2 max-w-md">
                Nemoj se ustručavati. Ako ti se sviđa nečiji profil, slobodno im pošalji poruku.
                Nemoj čekati da ti oni prvi pošalju poruku jer možda čekate jedno na drugo. Budi
                hrabar_ra! Možda se iz toga rodi nešto lijepo.
              </p>
            </div>

            <div className="flex-1">
              <img src={Image4} alt="Pošalji poruku" className="rounded-sm mt-8" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto p-4">
          <h2 className="text-3xl font-bold mt-4 text-center">I to je to!</h2>
          <p className="text-center mt-2 max-w-lg mx-auto">
            Upoznaš super osobicu pa se zajedno možete glupirati po planinama.
          </p>

          <img
            src={Homepage}
            alt="Upoznaš super osobicu pa se zajedno možete glupirati po planinama."
            className="mx-auto mt-12"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col items-center mx-auto">
            <h2 className="text-4xl font-bold text-center"> Tražimo contributore! </h2>
            <p className="text-center max-w-xl">
              Duga je open source aplikacija bazirana na <b>React</b> tehnologijama. U potrazi smo
              za novim članovima tima. Ako si zainteresiran_a za rad na ovom projektu, slobodno se
              javi našem adminu{' '}
              <a className="underline" href="mailto:admin@duga.app">
                admin@duga.app{' '}
              </a>
            </p>
          </div>
        </div>
      </section>

      <footer>
        <div className="bg-gray-800 text-white py-4">
          <div className="max-w-7xl mx-auto p-4">
            <p className="text-center">Duga © {new Date().getFullYear()}</p>
            <p className="text-center">Sva prava pridržana.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LoginPage;
