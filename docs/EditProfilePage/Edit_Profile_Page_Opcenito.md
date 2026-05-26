# EDIT_PROFILE_GENERAL_TESTS.md

> Manual test checklist for **Uredi profil** - **Općenito** tab and related profile display behavior.
> Locale: hr-HR (Croatian). Auth, verified email, and onboarding required.

---

## Access Control

- As an **unlogged user**, I must be redirected to **/login** if I open `/edit`.
- As an **unverified user**, I must be redirected to **/verify-email**.
- As a **verified user without onboarding**, I must be redirected to **/post-login**.
- As a **logged in onboarded user**, I must be able to edit only my own profile.
- As a **logged in user**, direct API attempts to update another user's profile must be rejected server-side.

---

## Tabs & Responsive Navigation

- As a **user**, the edit profile page must have **Općenito** and **Fotografije** sections.
- As a **desktop user**, the sections must appear as horizontal tabs.
- As a **mobile user**, the sections must be selectable from the mobile select control.
- As a **user**, switching between sections must keep the page usable and not lose already saved data.
- As a **user**, the active tab must be visually clear.

---

## Locked Identity Fields

- As a **user**, I must see my username in a disabled **Korisničko ime** field.
- As a **user**, I must see my age in a disabled **Dob** field.
- As a **user**, I must not be able to edit username or age from the general edit form.
- As a **user**, direct API attempts to change locked username/age must be rejected or ignored server-side.

---

## General Profile Fields

- As a **user**, I must be able to edit location from predefined city options.
- As a **user**, I must be able to clear the location field.
- As a **user**, I must be able to edit **Rod**, **Seksualnost**, and **Jedna rečenica o meni**.
- As a **user**, I must be able to choose **Trenutno tražim** from supported options such as friendship, date, relationship, marriage, partnership, nothing, and idk.
- As a **user**, I must be able to choose **Trenutni status veze** from supported relationship status options.
- As a **user**, I must be able to set lifestyle checkboxes for cigarettes, alcohol, and sport.
- As a **user**, I must be able to choose my favorite day of the week.
- As a **user**, I must be able to edit longer profile prompts: embarrassing story, too old for, makes my day, spirituality, interests, languages, and ending text.
- As a **user**, existing profile data must populate the form after current-user data loads.

---

## Emoji Support

- As a **user**, emoji-enabled text fields must support typing `:` followed by an emoji name.
- As a **user**, emoji suggestions must appear for supported fields when a valid token is typed.
- As a **user**, selecting an emoji must replace the current token.
- As a **user**, emoji suggestions must close after selection or when the token is removed.
- As a **user**, saved emoji content must render on my profile.

---

## Field Length Validation

- As a **user**, **Jedna rečenica o meni** must be limited to 100 characters.
- As a **user**, **Rod** must be limited to 100 characters.
- As a **user**, **Duhovnost/religioznost** must be limited to 300 characters.
- As a **user**, **Najsramotnija stvar**, **Imam previše godina za**, **Stvari koje mi uljepšavaju dan**, and **Za kraj** must be limited to 500 characters.
- As a **user**, **Interesi** and **Jezici** must be limited to 200 characters.
- As a **user**, fields over their limit must show **Polje ne smije biti dulje od X znakova.**
- As a **user**, invalid fields must block saving.

---

## YouTube Favorite Song

- As a **user**, I must be able to search YouTube by typing at least 2 characters.
- As a **user**, search must debounce before API calls.
- As a **user**, while searching I must see **Pretražujem YouTube...**.
- As a **user**, if search fails, I must see the YouTube search error message.
- As a **user**, if there are no results, I must see **Nema pronađenih pjesama**.
- As a **user**, selecting a result must store the YouTube URL and show **Odabrana YouTube pjesma**.
- As a **user**, I must be able to remove the selected song.
- As a **user**, saving must convert the selected URL to an embeddable YouTube URL.
- As a **user**, non-YouTube URLs must show **Mora biti YouTube link (youtube.com ili youtu.be)**.
- As a **viewer**, a valid favorite song must render as an embedded YouTube iframe on the profile.
- As a **viewer**, an invalid saved URL must show **Neispravan YouTube URL** instead of breaking the profile.

---

## IMDb Favorite Movie

- As a **user**, I must be able to search IMDb by typing at least 2 characters.
- As a **user**, search must debounce before API calls.
- As a **user**, while searching I must see **Pretražujem IMDb...**.
- As a **user**, if search fails, I must see the IMDb search error message.
- As a **user**, if there are no results, I must see **Nema pronađenih filmova**.
- As a **user**, selecting a movie must store its IMDb URL and show **Odabrani IMDb film**.
- As a **user**, I must be able to remove the selected movie.
- As a **user**, saving a non-selected or invalid movie URL must show **Odaberi film iz IMDb pretrage**.
- As a **viewer**, a valid favorite movie must render as an IMDb preview card with title/year/poster when available.
- As a **viewer**, an invalid saved movie must show **Neispravan IMDb film** instead of breaking the profile.

---

## Save Flow

- As a **user**, clicking **Spremi** must submit the form only when validation passes.
- As a **user**, saved data must be sent through the profile update API.
- As a **user**, boolean lifestyle fields must preserve explicit `false` values when already set.
- As a **user**, successful save must show a success toast.
- As a **user**, failed save must show an error toast with the reason where available.
- As a **user**, after refresh, saved values must appear on the edit form and public profile.

---

## My Profile Display Integration

- As a **user**, my profile page must show the **Općenito** tab with profile card and CTAs.
- As a **user**, profile fields with empty or `N/A` values should be hidden from the profile card.
- As a **user**, online/offline status must update via socket events.
- As a **user**, location, looking-for, relationship status, favorite day, and lifestyle values must render with Croatian labels.
- As a **user**, rich text fields must render links, YouTube, GIFs, and images through the shared formatter where supported.
- As a **user**, profile CTAs must navigate to edit profile, new chat, users directory, and forum ask flow.

---

## Profile Tabs Added Outside Edit

- As a **user**, **Moj profil** should include **Podijeli profil** with an internal link and copy action.
- As a **user**, copying the profile link must show **Kopirano** temporarily.
- As a **user**, **Pregledi** must show recent users who viewed my profile.
- As a **user**, profile view entries must link to viewer profiles and paginate when needed.
- As a **user**, **Pitanja** and **Odgovori** tabs should appear when I have forum activity.
- As a **user**, **Sve fotografije** should include my profile photos and forum photos when available.

---

## Security & Privacy

- As a **user**, profile update requests must require a valid authenticated app session.
- As a **user**, text fields must be sanitized before profile rendering.
- As a **user**, public profile links should use public IDs when available.
- As a **user**, profile-view data must only be visible to the profile owner.
- As a **user**, failed profile API calls must not leak private data in error messages.

---

## Responsiveness & Accessibility

- As a **mobile user**, all fields must stack and remain readable.
- As a **desktop user**, sections may use wider cards but must keep labels aligned.
- As a **keyboard user**, selects, inputs, textareas, emoji suggestions, search result buttons, and save action must be reachable.
- As a **screen-reader user**, labels must clearly identify each input.
