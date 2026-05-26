# DASHBOARD_TESTS.md

> Manual test cases for **Početna (Dashboard)** page.
> Locale: hr-HR (Croatian). Auth, verified email, and completed onboarding required.

---

## Access & Loading

- As an **unlogged user**, I must be redirected to **/login** if I open the dashboard.
- As an **unverified user**, I must be redirected to **/verify-email** before seeing dashboard content.
- As a **verified user without onboarding**, I must be redirected to **/post-login**.
- As a **logged in onboarded user**, I must be able to open **/** and see dashboard content.
- As a **user**, I must see a loader while current user or directory data is loading.
- As a **user**, protected dashboard content must not flash before auth/session checks finish.

---

## Welcome Hero For New Users

- As a **new user**, during the first 3 days after account creation I should see the welcome card **Izvrsno! Možeš krenuti od profila.**
- As a **new user**, the welcome card must offer actions to **Uredi profil**, **Preskoči na ljudeke**, and **Pošalji poruku**.
- As a **user**, clicking **Uredi profil** must navigate to **/edit**.
- As a **user**, clicking **Preskoči na ljudeke** must navigate to **/users**.
- As a **user**, clicking **Pošalji poruku** must navigate to **/new-chat**.
- As a **user**, clicking close on the welcome card must dismiss it.
- As a **user**, the dismissed welcome card must stay hidden after refresh using local storage.
- As a **user**, after the welcome period ends, the welcome card must no longer appear.

---

## Community Tips

- As a **user with no messages**, when the welcome hero is not shown, I should see **Kako započeti bolje upoznavanje** tips.
- As a **user**, the tips must encourage adding a clear profile photo, writing a personal profile, and starting a conversation.
- As a **user with messages**, the tips should not take space over more relevant dashboard content.

---

## Suggested Users / Ljudeki

- As a **user**, I must see **Ljudeki koje možeš upoznati**.
- As a **user**, suggested users must exclude my own profile.
- As a **user**, suggested users must include only verified users.
- As a **user**, suggested users should favor the latest/active online users.
- As a **user**, each user card must show avatar/fallback, username/name, age/location/details when available, and online state.
- As a **user**, clicking a user card action must open that user's public profile route.
- As a **user**, clicking **Pogledaj sve ljudeke** must navigate to **/users**.
- As a **user**, if no verified users are available, I must see the empty state **Još nema korisnika**.
- As a **user**, the empty state must offer **Uredi profil** and **Pogledaj sve ljudeke**.

---

## Latest Forum Question

- As a **user**, I should see **Zadnje pitanje s foruma** when forum questions exist.
- As a **user**, the latest forum card must show question title, author, created date, answer count, and vote score.
- As a **user**, clicking the latest forum card or **Otvori pitanje** must navigate to `/forum/questions/:id`.
- As a **keyboard user**, pressing Enter on the latest forum card must open the question.
- As a **user**, if there are no forum questions, I must see **Još nema pitanja**.
- As a **user**, clicking **Postavi pitanje** from the empty forum state must navigate to **/forum/ask**.
- As a **user**, while the latest question is loading, I must see **Učitavanje zadnjeg pitanja...**.

---

## Recently Added Photos

- As a **user**, I must see **Nedavno dodane fotke** when profile uploads exist.
- As a **user**, each photo card must show the latest uploaded photo using a secure image URL/blob.
- As a **user**, clicking a latest upload must open `/photo/:photoId`.
- As a **user**, the section must show how many latest photos are displayed.
- As a **user**, if no photos exist, I must see **Još nema dodanih fotografija**.
- As a **user**, clicking **Dodaj fotografije** from the empty state must navigate to **/edit**.
- As a **user**, moderated, deleted, or inaccessible photos must not appear.

---

## Latest Photo Comments

- As a **user**, I should see **Zadnji komentari na fotografije** when comments exist.
- As a **user**, the dashboard must show up to 3 newest photo comments sorted by creation time.
- As a **user**, each comment card must show commenter avatar/name, timestamp, comment snippet, and the related photo thumbnail/fallback.
- As a **user**, mentions inside comment snippets must be highlighted and profile-linkable.
- As a **user**, clicking a comment card must navigate to the related photo page.
- As a **user**, clicking the commenter identity must navigate to the commenter profile without opening the photo.
- As a **user**, if comments are loading, I must see **Učitavanje komentara...**.
- As a **user**, if no comments exist, the section should be hidden.

---

## Quick Actions

- As a **user**, I must see **Što želiš napraviti?** quick actions.
- As a **user**, **Izmijeni profil** must navigate to **/edit**.
- As a **user**, **Nova poruka** must navigate to **/new-chat**.
- As a **user**, **Postavi pitanje** must navigate to **/forum/ask**.
- As a **user**, I must see the contributor/community builder panel with `admin@duga.chat`.
- As a **user**, clicking **Uključi se** must open a mail link to `admin@duga.chat`.

---

## Footer & App Layout

- As a **user**, the dashboard must render inside the authenticated app layout.
- As a **user**, navigation, notification indicators, profile avatar, and footer links must remain available.
- As a **user**, public footer/policy links must open the correct public pages.

---

## Responsiveness & UX

- As a **mobile user**, cards and sections must stack without horizontal scrolling.
- As a **desktop user**, user cards, latest photos, latest comments, and quick actions should use available grid columns.
- As a **user**, images and avatars must keep safe aspect ratios.
- As a **user**, dashboard actions must be keyboard reachable.
- As a **user**, route transitions from dashboard actions must not leave stale loading states.

---

## Security & Privacy

- As a **logged in user**, I must only see data I am allowed to access.
- As a **logged in user**, private/deleted/moderated photos or comments must not appear on the dashboard.
- As a **logged in user**, dashboard API calls must require the active Duga app session.
- As a **logged in user**, stale data must be cleared when my session is revoked.
# DASHBOARD_TESTS.md

> Manual test cases for **Početna (Dashboard)** page.  
> Locale: hr-HR (Croatian).

---

## Suggested Users (Neke zanimljive osobice)

- As a **logged in user**, I must see a list of **suggested users** displayed as cards with:
  - Initials/avatar
  - Name/username
  - Online/offline indicator
  - Location (if available)
  - Age (if available)
  - Biography (if set)
- As a **user**, I must be able to **click “Pogledaj profil”** to open that person’s profile.
- As a **user**, I must be able to **click “Pošalji poruku”** to start a conversation.
- As a **user**, I must be able to **click “Pošalji poruku”** to start a conversation only if there is no conversation with that user from before.
- As a **user**, I must be able to **search users by name** in the search box.
- Only users with verified email are searchable
- Only users with verified email are shown on dashboard
- As a **user**, I must be able to **filter users** using the dropdown (e.g., by “ime”).
- As a **user**, I must be able to **page through results** using pagination controls.
- As a **user**, if there are no suggestions, I must see an empty state message.

---

## Recent Messages (Tvoje nedavne poruke)

- As a **user**, I must see my most recent messages in a feed with:
  - Sender’s avatar/initial
  - Sender’s name
  - Message text snippet
  - Timestamp
  - Attached media (image, GIF, etc.)
- As a **user**, I must be able to **click a message** to open the full chat.
- As a **user**, I must not see messages from conversations I’m not part of.
- As a **user**, if I have no recent messages, I must see an empty state message.
- As a **user**, if I did not read a message, I must see blue background of the unread message
- As a **user**, I must see media rendered properly

---

## Recently Added Photos (Nedavno dodane fotke)

- As a **user**, I must see thumbnails of profile photos recently uploaded by other users.
- As a **user**, each photo must show the uploader’s name/username.
- As a **user**, I must be able to **click a photo** to view it full-size in its context (profile, gallery, or modal).
- As a **user**, if a photo was moderated/deleted, it must not appear here.
- As a **user**, if no photos exist, the section should be hidden

---

## Action Cards

- As a **user**, I must see an action card prompting me to **upgrade my profile**.
  - Clicking **“Izmijeni profil”** must take me to the profile edit page.
- As a **user**, I must see an action card prompting me to **start a new conversation**.
  - Clicking **“Nova poruka”** must open a new message flow.
- As a **user**, I must see an action card prompting me to **contact support/help**.
  - Clicking **“Javi nam se”** must take me to support form or email link.

---

## Footer

- As a **user**, I must see footer links:
  - **Prijavi problem** (Report a problem)
  - **Politika kolačića** (Cookie policy)
  - **Politika privatnosti** (Privacy policy)
  - **Uvjeti korištenja** (Terms of use)
- As a **user**, clicking each link must open the correct page in-app or in a new tab.

---

## General UX & Responsiveness

- As a **user**, the dashboard must load without console errors.
- As a **user**, the layout must adjust responsively (desktop/tablet/mobile).
- As a **user**, avatars and thumbnails must maintain correct aspect ratios.
- As a **user**, pagination/search/filter controls must be usable on all devices.

---

## Security & Access Control

- As an **unlogged user**, I must be redirected to **login** if I try to open the dashboard.
- As a **logged in user**, I must only see data relevant to me (my messages, public/safe photos, suggested users).
- As a **logged in user**, sensitive or deleted content must not appear here.
