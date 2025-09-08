# EDIT_PROFILE_PAGE_TESTS.md

> User-story style manual test checklist for **Edit Profile Page** — _Općenito_ tab.  
> Stack: React SPA + Auth0 (post-login form defines age and username).

---

## Access Control

- As a **logged in user**, I must be able to edit **only my own profile**.
- As a **logged in user**, if I try to edit another user’s profile (via URL manipulation, API call, etc.), I must be **blocked** with an error toast.
- As an **unlogged in user**, I must not be able to access the **Edit Profile Page**; I should be redirected to **login**.

---

## Tabs

- As a **user**, the profile edit page must have two tabs:
  - **Općenito** (general info)
  - **Fotografije** (photos)
- As a **user**, when on the **Općenito tab**, I must see only **general fields** (bio, city, interests, etc.), not photo upload fields.
- As a **user**, switching between tabs must be **smooth**

---

## Fields — Constraints

- As a **user**, I must **not** be able to edit my **username** (field locked/read-only).
- As a **user**, I must **not** be able to edit my **age** (set during post-login form; field locked).
- As a **user**, I must be able to edit all other **general fields** (e.g., bio, gender, location, interests, website, contact info).
- As a **user**, any fields that allow **media content** (e.g., avatar, header photo, rich bio) must handle media parsing correctly:
  - **Emojis** should render inline.
  - **Links** must be clickable and sanitized.
  - **GIFs/images** must preview inline if supported.

---

## Editing Flow

- As a **user**, when I change a field value, I must see an option to **save** or **cancel** changes.
- As a **user**, clicking **save** must update my profile via API and show a **success toast**.
- As a **user**, if the API call fails (network error, validation error), I must see an **error toast** and the field must revert to its last saved value.

---

## Validation

- As a **user**, required fields (if any, e.g., bio or display name) must show a **validation error** if empty on save.
- As a **user**, links entered into fields must be **validated** (must start with `http://` or `https://`).
- As a **user**, text fields must block **disallowed characters** or scripts to prevent injection.
- As a **user**, if I try to upload oversized or unsupported media (e.g., avatar), I must be blocked with a **toast error**.

---

## YouTube Fields

- As a **user**, I must be able to add a **YouTube link** in the dedicated YouTube fields.
- As a **user**, the fields must only accept **valid YouTube URLs**, e.g.:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
- As a **user**, if I try to enter a **non-YouTube link** (e.g., Vimeo, TikTok, generic website), I must see a **validation error**
- As a **user**, if I try to save with an invalid YouTube link, the save must be **blocked** until fixed.
- As a **user**, if the YouTube link is valid, it must be saved and shown on my profile as a embedded video

---

## UX & Feedback

- As a **user**, successful saves must show a **toast**
- As a **user**, failed saves must show a **toast** with the error reason.
- As a **user**, fields must show **inline validation messages** where possible

---

## Security

- As a **user**, all profile update requests must be validated **server-side** against my user ID (JWT/session).
- As a **user**, I must not be able to edit restricted fields (`username`, `age`) even if I try to send API payloads manually.

---

## Responsiveness

- As a **mobile user**, the **Općenito tab** form must be responsive, with fields stacked vertically.
- As a **desktop user**, fields may align in multiple columns but must remain clear and usable.
- As a **user**, tab switching (Općenito ↔ Fotografije) must work smoothly on all devices.
