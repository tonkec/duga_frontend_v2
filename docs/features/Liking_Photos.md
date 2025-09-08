# CHAT_PHOTO_LIKES_TESTS.md

> User-story style manual test checklist for photo like functionality in user profile photos

---

## Core Like/Unlike Flow

- As a **logged in user**, I must be able to **like a photo** from another user
- As a **logged in user**, I must be able to **like a photo** from myself
- As a **logged in user**, I must be able to **unlike** a photo I previously liked (toggle behavior).
- As a **non-member**, I must **not** be able to like or unlike any photo I’m not a participant of.

---

## Real-Time Updates

- As a **logged in user**, I must see the **like count** update in real time across all participants.
- As a **logged in user**, I must see a **list/preview of who liked** (avatars or names of users).
- As a **logged in user**, I must see my like/unlike reflected **immediately** (optimistic UI) and rolled back if the server rejects it.

---

## S3 & Data Model Constraints

- As a **logged in user**, likes must be tied to the **photo ID**
- As a **logged in user**, if a **photo message is deleted**, its likes must also be removed or hidden.

---

## UX & Feedback

- As a **logged in user**, when I like/unlike a photo, I must see **visual feedback** (toast).
- As a **logged in user**, if liking fails (e.g., offline, network error), I must see an **error message** and the UI must roll back.

---

## Notifications

- As a **photo sender**, I should receive an **in-app notification** when someone likes my photo.
