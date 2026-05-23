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
