# USER_TAGGING_IN_PROFILE_PHOTO_COMMENTS.md

> Manual test checklist for user mentions in profile photo comments, comment edits, photo descriptions, and reused mention inputs.

---

## Mention Input Trigger

- As a **user**, typing `@` in a comment textarea must start mention detection.
- As a **user**, typing letters or numbers after `@` must search users by username.
- As a **user**, the dropdown must update after the debounce delay as I type more characters.
- As a **user**, if the text no longer ends with an active `@query`, the dropdown must close.
- As a **user**, focusing back into a textarea that still ends with `@query` should reopen suggestions.
- As a **user**, clicking outside the mention input must close suggestions.

---

## Suggestions

- As a **user**, suggestions must show matching users with avatar/fallback and `@username`.
- As a **user**, suggestions must be scrollable when many users match.
- As a **user**, selecting a suggestion must replace the active `@query` with the full `@username` followed by a space.
- As a **user**, selecting a suggestion must track the tagged user's ID for submission.
- As a **user**, selecting the same user repeatedly must not duplicate tracked tagged users.
- As a **user**, if no suggestions match, no invalid linked mention should be created.

---

## Creating Comments With Tags

- As a **user**, I must be able to tag other users in a new profile photo comment.
- As a **user**, submitted comment payloads must include `taggedUserIds` for selected mentions.
- As a **user**, plain `@text` that was not selected from suggestions must remain plain text.
- As a **user**, tag selection must survive adding an image, GIF, or emoji before submit.
- As a **user**, after successful comment submit, tracked tagged users must reset.

---

## Editing Comments With Tags

- As a **comment author**, opening edit mode must initialize existing tagged users.
- As a **comment author**, I must be able to add tags while editing.
- As a **comment author**, I must be able to remove tag text while editing.
- As a **comment author**, saving the edit must send the current `taggedUserIds`.
- As a **comment author**, socket updates must refresh rendered tagged users for viewers.
- As a **comment author**, deleting a comment must remove visible tags with the comment.

---

## Rendering Tags

- As a **viewer**, selected mentions must render as blue underlined profile links.
- As a **viewer**, clicking a tagged user must navigate to that user's profile route.
- As a **viewer**, profile navigation should use public IDs when available.
- As a **viewer**, mention matching should be case-insensitive when resolving rendered tags.
- As a **viewer**, the same tag rendering must work in dashboard latest comments and full photo comments.
- As a **viewer**, sanitized text around mentions must not execute scripts or render unsafe HTML.

---

## Photo Descriptions

- As a **profile owner**, I must be able to tag users in photo descriptions while uploading new profile photos.
- As a **profile owner**, I must be able to tag users in descriptions for existing photos.
- As a **profile owner**, tagged user IDs must be saved with photo description updates.
- As a **viewer**, tagged users in photo descriptions must render as profile links.
- As a **profile owner**, description tags must be preserved when setting a photo as profile photo.

---

## Constraints & Abuse Prevention

- As a **user**, I must not be able to tag a user that does not exist.
- As a **user**, duplicate tags for the same user should be collapsed or ignored.
- As a **user**, direct API calls with invalid tagged user IDs must be rejected server-side.
- As a **user**, mention lookups must not expose unverified, blocked, deleted, or private users beyond product policy.
- As a **user**, mention suggestions must not break if username lookup fails.
- As a **system**, notifications must only be created for valid tagged users.

---

## Notifications

- As a **tagged user**, I should receive an in-app notification when I am tagged in a new profile photo comment.
- As a **tagged user**, I should receive or update notification state when I am newly added in an edited comment if product policy supports edit notifications.
- As a **tagged user**, I should not receive duplicate notifications for repeated socket update payloads.
- As a **tagged user**, clicking the notification should open the related photo page/comment context.
- As a **comment author**, tagging myself should be blocked or treated consistently according to product policy.
