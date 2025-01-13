# Next to do

- typing testirat
- poruke fixanje/improvements

  - ikonica za profile photo bi se trebala pokazat samo jednom 13.01
  - click na chat pokazuje duple poruke, refreshaj? => nakon deploymenta

- novi featuri za poruke
  - seen?
  - read/undread
  - emojis -> https://github.com/missive/emoji-mart

### Enhancements

- napravit bubble u chatu?
- all chats dodat jos contenta, redizajnirat
- all profiles ne prikazuje profilnu fotku => stavit u field user avatar url od profilne fotke tog usera, napravit to na BE
- maknut opis s fotke ako nema opisa
- objasnjenje za iframove
- dal se moze vidjet ko je lajkao fotku?
- stavit na profilu na fotografijama broj lajkova

### Sljedeci veliki feature

- following
- breadcrumbs
- tagganje usera u komentarima
- going online/offline
- stavit na all profiles da li je user trenutno aktivan ili ne
- error boundaries
- slanje slike u porukama => s3
- delete account

- notifikacije
  - follow
  - new message
  - komnetar
  - lajk
  - sound za notifikaciju?

### Easy wins

- loaderi za slike
- React helmet

### Gotovo

- sto se dogodi kad se izbrise chat?
  - stavit modal
- sockets provjera

  - upvote/downvote fotkica
  - editiranje komentara
  - slanje poruka

- dodat content na all profiles page 16.01
  - currently online users
  - finish your profile
  - want to improve duga?
  - latest chats
- dovrsit all profiles redizajn

  - responsiveness
  - linkat cta buttone
  - nedavne poruke
  - nedavni komentari

- refreshanje mijenja layout? 10.01
- ako je chat prazan, onda se ne bi trebao pokazat na new-chat? 10.01
- posalji poruku button na other profile page => samo ako vec nije napravljen chat 10.01
- posalji poruku button na all profiles page => samo ako vec nije napravljen chat 10.01
- na poruci u new-chat treba pisat zadnja poruka
- svi profili unaprijedit
- brisanje chata
- timestamp
- 404 na postojeci chat
- received messages refreshaj => styling se promijeni
- kad se napise nova poruka i onda scrolla
- fallback za avatar svg ili slova?
- link na other user profile page
- napisat s kim je trenutno chat
- paginacija poruka
- kad se refresha chat, nestane
- samo user tog chata moze vidjet taj chat
- find user to chat with => prikazat postojece chatove
- send message
- receive message
- loader za lodanje data
- create chat
- edit comment socket emit
- photo likes
- other user profile page => uzet myprofile page kao template
- dodat komentare na fotke
- photo comments
- crud komentara
- istestirat s dva usera da li rade socketi
- dodat formu na sliku od tudeg profila
- dodat rutu za fotku
- paginacija svih profila
- verification email

  - kad se signupa, dobije email s tokenom za potvrdu
  - ne moze se ulogirat ako nije email potvrden

- spremit auth token u cookie => https://www.npmjs.com/package/react-cookie
- forgot password
- reset password
- edit profile page
- error kad je kriva sifra na loginu
- zasto su svi fields required
- validacija fajlova
- editirat postojeci desc
- POSTAVI KAO PROFILNU
- prikazat postojeci desc
- ne moze se izbrisat ako nije vec spremljena
- footer
- umjesto rijeci logout stavit ikonicu
- maknut na all users samog sebe
- filteri na all users
- dodat logo na svaku stranicu
- fotke
  - ako je jedna profilna, onda druga se mora unchecked => 30.12

### Otkazano

- stavit paginaciju buttone u zrak
