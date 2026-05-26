# EDIT_PROFILE_PHOTOS_TESTS.md

> Manual test checklist for **Uredi profil** - **Fotografije** tab, profile photo selection, descriptions, tags, and moderation.
> Locale: hr-HR (Croatian). Scope: only the profile owner can manage their photos.

---

## Access & Loading

- As an **unlogged user**, I must be redirected to login before opening the photo editor.
- As a **logged in user**, I must only be able to manage my own profile photos.
- As a **logged in user**, direct API attempts to manage another user's photos must be rejected server-side.
- As a **profile owner**, I must see **Učitavanje...** while current user data is loading in the uploader.
- As a **profile owner**, if current user data cannot be loaded, I must see **Ne možemo učitati tvoje podatke. Molimo pokušaj ponovo kasnije.**

---

## Existing Photos

- As a **profile owner**, if I already have photos, I must see **Tvoje fotografije**.
- As a **profile owner**, existing photos must render in a responsive grid with secure image blobs.
- As a **profile owner**, the current profile photo must show a **Profilna** badge.
- As a **profile owner**, each existing photo must have a description input.
- As a **profile owner**, each existing photo must have a delete action.
- As a **profile owner**, each existing photo must offer **Postavi kao profilnu** when it is not selected.
- As a **profile owner**, selecting one photo as profile photo must unselect all other photos.
- As a **profile owner**, saving photo changes must submit descriptions, tagged users, and profile-photo selection together.

---

## Adding New Photos

- As a **profile owner**, I must see **Dodaj nove fotografije**.
- As a **profile owner**, I must see that the maximum total number of photos is 5.
- As a **profile owner**, I must be able to select multiple files at once.
- As a **profile owner**, selected files must render local previews before upload.
- As a **profile owner**, I must be able to remove a selected local preview before saving.
- As a **profile owner**, the file input must accept only configured allowed image types.
- As a **profile owner**, selecting unsupported formats must show **Dozvoljeni formati su .png,.jpg,.jpeg,.svg!**
- As a **profile owner**, selecting more than the total max must show **Maksimalan broj fotografija je 5!**
- As a **profile owner**, submitting beyond the max must show **Maksimalan broj svih slika je 5**.
- As a **profile owner**, filenames should be normalized before upload.

---

## Saving & Pending State

- As a **profile owner**, when uploads or photo changes are saving, I must see **Fotografije se spremaju...**.
- As a **profile owner**, new-photo previews must show **Spremanje...** overlay while uploading.
- As a **profile owner**, existing-photo save button must show **Spremanje...** while pending.
- As a **profile owner**, buttons and inputs that mutate photo state must be disabled while saving.
- As a **profile owner**, successful save must show **Fotografije uspješno spremljene**.
- As a **profile owner**, successful upload must clear the file input and selected local previews.
- As a **profile owner**, upload errors must show backend error reasons in a toast.
- As a **profile owner**, after successful save, photo queries must refresh.

---

## Descriptions

- As a **profile owner**, I must be able to add optional descriptions to new photos before upload.
- As a **profile owner**, I must be able to edit descriptions on existing photos.
- As a **profile owner**, descriptions must trim/control whitespace and remove control characters before saving.
- As a **profile owner**, descriptions must be limited to 100 characters.
- As a **profile owner**, if a description is too long, I must see **Opis fotografije ne može biti duži od 100 znakova!**
- As a **profile owner**, save actions must be disabled while any description has a length error.
- As a **viewer**, saved photo descriptions must appear on the photo page.
- As a **viewer**, description text must render safely through the shared content formatter.

---

## Description Tags & Emojis

- As a **profile owner**, I must be able to type `@` in photo descriptions and select users from suggestions.
- As a **profile owner**, tagged user IDs must be saved with new photo descriptions.
- As a **profile owner**, tagged user IDs must be saved when editing existing descriptions.
- As a **profile owner**, existing description tags must preload when editing a photo.
- As a **profile owner**, I must be able to type `:` and select emoji suggestions in descriptions.
- As a **profile owner**, selected emoji must replace the current emoji token.
- As a **viewer**, tagged users in descriptions must render as profile links.
- As a **viewer**, emojis in descriptions must render without breaking layout.

---

## Deleting Photos

- As a **profile owner**, clicking **Obriši** on an existing photo must open a confirmation modal.
- As a **profile owner**, the modal must ask **Jesi li siguran_na da želiš obrisati fotografiju?**
- As a **profile owner**, confirming delete must remove the photo from the gallery.
- As a **profile owner**, deleting a photo must delete associated description and tags.
- As a **profile owner**, if deletion fails, I must see an error toast and the UI should recover to server state.
- As a **profile owner**, deleting the active profile photo must leave the profile with a fallback avatar or another selected profile photo according to backend policy.

---

## Photo Page Integration

- As a **profile owner**, I must be able to set a profile photo from the `/photo/:photoId` page.
- As a **profile owner**, clicking **Postavi kao profilnu** on the photo page must preserve description and tags.
- As a **profile owner**, the active profile photo page must show **Trenutna profilna**.
- As a **viewer**, the photo page must show owner identity, likes, description, and comments.
- As a **viewer**, clicking another user's owner identity must open that user's profile.

---

## My Profile Integration

- As a **profile owner**, if I have profile images, **Moj profil** must show the **Profilne fotografije** tab.
- As a **profile owner**, if I have profile or forum photos, **Moj profil** must show the **Sve fotografije** tab.
- As a **viewer**, selected profile photo must be used in avatars across dashboard, chat, comments, notifications, and profiles where supported.
- As a **viewer**, deleted or moderated photos must not appear in profile galleries or dashboard latest uploads.

---

## AWS Rekognition & Processing

- As a **profile owner**, selected images must be moderated before being persisted.
- As a **profile owner**, explicit, sexual, or suggestive content above the configured threshold must be blocked.
- As a **profile owner**, blocked images must not appear in galleries, latest uploads, or profile pages.
- As a **profile owner**, moderation failures must fail closed.
- As a **system**, accepted images should be processed with sharp, resized/compressed, and stripped of EXIF metadata.
- As a **system**, accepted images must be stored privately.
- See also `Comment_Uploads_Rekognition.md` and chat upload moderation docs for shared moderation expectations.

---

## Security & Storage

- As a **system**, rejected files must not remain in S3 or must be deleted immediately if staged.
- As a **system**, upload attempts should be rate-limited to prevent abuse.
- As a **system**, moderation decisions should be logged without storing blocked image content.
- As a **user**, photo upload/update/delete requests must require a valid authenticated app session.
- As a **user**, only authorized users should receive secure photo URLs or blobs.

---

## Responsiveness & Accessibility

- As a **mobile user**, existing and new photo cards must stack cleanly.
- As a **desktop user**, photo grids should use multiple columns.
- As a **keyboard user**, file input, description fields, emoji/mention suggestions, profile photo checkbox, delete, and save actions must be reachable.
- As a **screen-reader user**, destructive delete confirmation must be clear before confirming.
