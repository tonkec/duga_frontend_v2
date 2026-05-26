# PROFILE_PHOTO_LIKES_TESTS.md

> Manual test checklist for liking/unliking **profile photos** on `/photo/:photoId`.
> Locale: hr-HR (Croatian). Auth and completed onboarding required.

---

## Access & Visibility

- As an **unlogged user**, I must be redirected to login before accessing `/photo/:photoId`.
- As a **logged in user**, I must be able to open a valid photo page.
- As a **logged in user**, if the photo is missing, deleted, or inaccessible, I must see **Slika nije pronađena ili je obrisana.**
- As a **logged in user**, the like control must not render if the page has no valid photo ID.
- As a **logged in user**, private photo data must be loaded through authorized secure URL/blob access.

---

## Core Like/Unlike Flow

- As a **logged in user**, I must be able to like another user's photo.
- As a **logged in user**, I must be able to like my own photo.
- As a **logged in user**, after liking a photo, the heart must switch to the filled/active state.
- As a **logged in user**, I must be able to unlike a photo I previously liked.
- As a **logged in user**, after unliking, the heart must return to the inactive state.
- As a **logged in user**, repeated rapid clicks must not create duplicate likes or negative counts.
- As a **logged in user**, the like/unlike buttons must be disabled while a local like action is pending.

---

## Optimistic UI & Rollback

- As a **logged in user**, liking should update the local UI immediately before the socket/API confirmation.
- As a **logged in user**, unliking should remove my local like immediately before confirmation.
- As a **logged in user**, if liking fails, my optimistic like state must roll back to the server state.
- As a **logged in user**, if unliking fails, my optimistic unlike state must roll back to the server state.
- As a **logged in user**, pending local likes must be reconciled when the server sends the latest likes list.

---

## Real-Time Updates

- As a **viewer**, I must see the like count update when another user likes the same photo.
- As a **viewer**, I must see the like count update when another user unlikes the same photo.
- As a **viewer**, socket event `upvote-upload` must update only the matching photo.
- As a **viewer**, socket event `downvote-upload` must update only the matching photo.
- As a **viewer**, socket updates must clear stale optimistic state for that photo.
- As a **viewer**, likes for another photo must not affect the currently open photo page.

---

## Likes List / Preview

- As a **logged in user**, I must see the total like count or likes dropdown/preview.
- As a **logged in user**, opening the likes list must show users who liked the photo where supported.
- As a **logged in user**, the list must update after real-time like/unlike events.
- As a **logged in user**, users in the likes list must not duplicate after repeated socket updates.

---

## Photo Page Integration

- As a **photo owner**, if the photo is already my profile photo, I must see **Trenutna profilna**.
- As a **photo owner**, if the photo is not my profile photo, I must be able to click **Postavi kao profilnu**.
- As a **photo owner**, setting a profile photo must preserve photo description and tagged users.
- As a **viewer**, I must see the photo owner identity next to the like control.
- As a **viewer**, clicking another user's identity must navigate to that user's profile.
- As a **photo owner**, my own identity should be shown but should not navigate away unnecessarily.

---

## Notifications

- As a **photo owner**, I should receive an in-app notification when another user likes my photo if the product supports like notifications.
- As a **photo owner**, I should not receive duplicate notifications for repeated like socket events.
- As a **photo owner**, I should not receive a notification when I like my own photo unless explicitly supported.

---

## Error & Offline States

- As a **logged in user**, if the like API fails, I must see an error toast or visible recovery state.
- As a **logged in user**, if the socket is unavailable, API like/unlike should still resolve through the server state where supported.
- As a **logged in user**, if I go offline during like/unlike, the UI must not remain permanently pending.
- As a **logged in user**, refreshing the page after a failed optimistic update must show the persisted server state.

---

## Security & Data Integrity

- As a **logged in user**, likes must be tied to the photo/upload ID.
- As a **logged in user**, each user can have at most one active like per photo.
- As a **logged in user**, unliking must remove only my own like.
- As a **logged in user**, if a photo is deleted, its likes must be removed or hidden.
- As a **non-owner/non-admin**, I must not be able to mutate likes for a deleted or unauthorized photo through direct API calls.
- As a **system**, like/unlike endpoints must require a valid authenticated app session.
