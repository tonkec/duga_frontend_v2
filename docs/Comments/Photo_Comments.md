# PROFILE_PHOTO_COMMENTS_TESTS.md

> Manual test checklist for **profile photo comments** on `/photo/:photoId`.
> Stack: Socket.IO, AWS S3/private media, local blob previews, Giphy, emoji search, mention input.
> Locale: hr-HR (Croatian). Auth and completed onboarding required.

---

## Access & Photo Context

- As an **unlogged user**, I must be redirected to login before accessing photo comments.
- As a **logged in user**, I must be able to open comments under a valid profile photo.
- As a **logged in user**, if the photo is deleted or inaccessible, comments must not render as if the photo exists.
- As a **logged in user**, the comments panel must be shown below the photo card.
- As a **logged in user**, the comments header must show **Komentari** and either the comment count or **Budi prva osoba koja komentira**.
- As a **logged in user**, the side panel must show conversation ideas such as reacting, tagging, and being supportive.

---

## Create Comments

- As a **logged in user**, I must be able to comment on my own photos.
- As a **logged in user**, I must be able to comment on other users' photos.
- As a **logged in user**, I must be able to submit a text-only comment.
- As a **logged in user**, I must be able to submit a comment with only an image.
- As a **logged in user**, I must be able to submit a comment with only a GIF.
- As a **logged in user**, I must be able to submit text plus image or text plus GIF.
- As a **logged in user**, submitting an empty comment with no image/GIF must be blocked with **Unesi komentar, dodaj sliku ili GIF**.
- As a **logged in user**, while a comment is being sent, the submit button must show **Slanje** and the form must avoid duplicate submits.
- As a **logged in user**, after a successful submit, the input, image, GIF, emoji suggestions, and tagged users must reset.
- As a **logged in user**, the newly created comment must be added to the local list without waiting for a full page reload.

---

## Comment Composer

- As a **logged in user**, I must type comments in a mention-enabled textarea.
- As a **logged in user**, typing `@` followed by username characters must show user suggestions.
- As a **logged in user**, selecting a suggested user must insert `@username` and track the tagged user ID.
- As a **logged in user**, typing `:` followed by an emoji name must show quick emoji suggestions.
- As a **logged in user**, selecting a quick emoji must replace the emoji token in the comment text.
- As a **logged in user**, clicking the emoji button must open the emoji search panel.
- As a **logged in user**, clicking the GIF button must open the Giphy search panel.
- As a **logged in user**, selecting a GIF must show a preview and include the GIF URL in the submitted comment.
- As a **logged in user**, I must be able to remove a selected GIF before submit.
- As a **logged in user**, selecting an image must show a local preview.
- As a **logged in user**, I must be able to remove a selected image before submit.

---

## Image Handling

- As a **logged in user**, I must only be able to select allowed image types from the configured list.
- As a **logged in user**, unsupported image types must show a toast such as **Dozvoljeni formati su ...** and must not be attached.
- As a **logged in user**, selected image filenames should be normalized before upload.
- As a **logged in user**, attached image previews must use local blob URLs before upload.
- As a **logged in user**, while upload is pending, the preview must show **Slanje...** overlay.
- As a **logged in user**, comment images must be stored privately and displayed through authorized secure/blob access.
- As a **logged in user**, if the combined image count would exceed the app maximum, I must see **Ukupan maksimalan broj slika je 5**.
- As a **logged in user**, upload/network failures must show an error and must not create a broken comment.

---

## Comment List, Sorting & Pagination

- As a **logged in user**, I must see existing comments under the photo.
- As a **logged in user**, comments must be sorted newest first.
- As a **logged in user**, comments must be paginated with 3 comments per page.
- As a **logged in user**, pagination must use stable comment IDs as item keys.
- As a **logged in user**, while comments are loading, I must see **Učitavanje komentara...**.
- As a **logged in user**, if no comments exist, I must see **Još nema komentara.**
- As a **logged in user**, comments returned by API must hydrate the local list once per photo load and not overwrite newer socket updates unexpectedly.

---

## Comment Rendering

- As a **logged in user**, each comment must show commenter avatar, display name, and timestamp.
- As a **comment author**, my own comments must be labeled **Tvoj komentar**.
- As a **viewer**, clicking another commenter's identity must navigate to that user's profile.
- As a **viewer**, clicking my own comment identity must not navigate away unnecessarily.
- As a **viewer**, comment text must be sanitized before rendering.
- As a **viewer**, plain links, YouTube links, GIF URLs, and supported media links must render through the shared content formatter.
- As a **viewer**, attached comment images must render under the comment text.
- As a **viewer**, tagged users must render as blue underlined profile links.

---

## Editing Comments

- As a **comment author**, I must see **Izmijeni** on my own comments.
- As a **non-author**, I must not see edit controls for someone else's comment.
- As a **comment author**, clicking **Izmijeni** must open a mention-enabled edit textarea.
- As a **comment author**, I must be able to edit comment text and tagged users.
- As a **comment author**, I must not be able to edit an already uploaded comment image from the edit form.
- As a **comment author**, the save button must be disabled when text is unchanged.
- As a **comment author**, saving an empty edit must show **Komentar je obavezan.**
- As a **comment author**, successful edits must update the comment locally and via socket events.
- As a **comment author**, failed edits must keep the old comment visible or recover to server state.

---

## Deleting Comments

- As a **comment author**, I must see **Obriši** on my own comments.
- As a **non-author**, I must not see delete controls for someone else's comment.
- As a **comment author**, clicking delete must open a confirmation modal **Obrisati komentar?**
- As a **comment author**, confirming delete must remove the comment locally.
- As a **comment author**, deleting a comment with media must remove or invalidate associated media.
- As a **comment author**, if deletion fails, the comment must remain visible or be restored.

---

## Real-Time Socket Behavior

- As a **viewer**, `receive-comment` must add new comments without refresh.
- As a **viewer**, duplicate `receive-comment` payloads must not duplicate a comment already in the list.
- As a **viewer**, `remove-comment` must remove only comments for the currently open photo.
- As a **viewer**, `update-comment` and `edit-comment` must update the matching comment text and tagged users.
- As a **viewer**, malformed update payloads must not break the comments page.
- As a **viewer**, leaving the page must unsubscribe comment socket listeners.

---

## Notifications

- As a **photo owner**, I should receive an in-app notification when another user comments on my photo.
- As a **tagged user**, I should receive an in-app notification when I am tagged in a photo comment.
- As a **photo owner**, comment edit events should not create duplicate "new comment" notifications.
- As a **non-owner**, I must not receive owner notifications for photos I do not own.
- As a **notification recipient**, clicking a comment notification should open the related photo page/comment context.

---

## Security & Authorization

- As a **logged in user**, comment create/edit/delete requests must require a valid authenticated app session.
- As a **non-author**, I must not be able to edit or delete another user's comments through direct API calls.
- As a **logged in user**, comment media must remain private and only be served through authorized access.
- As a **system**, text must be sanitized to prevent script injection.
- As a **system**, media moderation must run before storing images; see `Comment_Uploads_Rekognition.md`.
- As a **system**, comment tags must reference valid users and be enforced server-side.

---

## Responsiveness & Accessibility

- As a **mobile user**, composer buttons, previews, and pagination must be usable without horizontal scrolling.
- As a **desktop user**, the comments list and idea panel should use the two-column layout.
- As a **keyboard user**, I must be able to focus the textarea, submit button, media buttons, edit/delete actions, and pagination controls.
- As a **screen-reader user**, media buttons should expose labels such as **Dodaj sliku**, **Dodaj GIF**, and **Dodaj emoji**.

---

## Related Docs

- See `Tagging_Users_In_Comments.md` for detailed mention behavior.
- See `Comment_Uploads_Rekognition.md` for image moderation behavior.
