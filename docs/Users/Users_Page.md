# USERS_PAGE_TESTS.md

> Manual test cases for **Svi korisnici** directory search, filters, pagination, and profile navigation.
> Locale: hr-HR (Croatian). Auth and completed onboarding required.

---

## Access & Loading

- As an **unlogged user**, I must be redirected to **login** if I open **/users**.
- As a **logged in onboarded user**, I must be able to open **/users**.
- As a **user**, I must see a loader while current user data or user directory data is loading.
- As a **user**, the page must not show partial or stale user cards while the required data is loading.

---

## Visible Users

- As a **user**, I must only see other users, not my own profile.
- As a **user**, I must only see users with verified email.
- As a **user**, each user card must show the available identity/profile details supported by the shared user card.
- As a **user**, online users must show an online state on the card.
- As a **user**, clicking a user card action must open that user's profile using the public profile route when available.

---

## Search & Filters

- As a **user**, I must be able to search users from the directory filter controls.
- As a **user**, the default search criterion must be **Ime** / username.
- As a **user**, changing the selected filter criterion must update which field is searched.
- As a **user**, I must be able to clear search and return to the full visible verified directory.
- As a **user**, the search must not reveal unverified users or my own profile.

---

## Profile Photo Filter

- As a **user**, I must be able to enable **Prikaži samo korisnike s profilnom**.
- As a **user**, while this filter checks photos, I must see **Provjeravam profilne slike...**.
- As a **user**, only users with an available profile photo must remain when the filter is enabled.
- As a **user**, disabling the filter must restore users that match the current text search.
- As a **user**, failed profile-photo lookups must not break the directory page.

---

## Pagination & Responsiveness

- As a **desktop user**, I should see up to 8 users per page.
- As a **mobile/tablet user**, I should see up to 4 users per page.
- As a **user**, pagination controls must move through the filtered result set.
- As a **user**, changing search or filters must keep pagination aligned with the available result count.
- As a **user**, user cards and pagination must remain usable on mobile, tablet, and desktop.

---

## Empty States

- As a **user**, if no verified users are available, I must see **Nema dostupnih korisnika**.
- As a **user**, if my search has no matches, I must see **Nema korisnika za ovaj upit**.
- As a **user**, the no-results message must include the search query and selected criterion.
- As a **user**, clicking **Očisti pretragu** must reset the search and default filter criterion.

---

## Security & Edge Cases

- As a **user**, user directory API calls must require a valid authenticated session.
- As a **user**, public IDs should be used for profile navigation when available.
- As a **user**, the directory must not expose deleted, blocked, or unverified users.
- As a **user**, network failures must use the app's standard error handling and must not render broken cards.
