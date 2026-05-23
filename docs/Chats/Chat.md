# CHAT_FUNCTIONALITY_TESTS_S3.md

> User-story style manual test checklist for chat features using **Socket.IO** and **AWS S3** (multer-s3 + sharp).

## Assumptions (S3 & Media)

- Images are processed via **sharp** (resize/compress/strip metadata) before upload.
- Server validates **MIME types and size limits**. GIFs supported.

---

## Access Control & Authorization

- As an **unlogged in user**, I must **not** be able to access any chat
- As an **unlogged in user**, I must **not** be able to access any chat photo URLs.
- As a **non-member**, I must **not** be able to access a chat I’m not a participant of.
- As a **chat user**, I must be able to access only the chats I belong to.
- As a **chat user**, I can only see media that belongs to the chat I am part of

---

## Sending & Receiving Messages

- As a **chat user**, I must be able to send **text messages** and see them appear in real time in the thread.
- As a **chat user**, I must be able to see **text messages** appear in real time in the chat
- As a **chat user**, I must be prevented from sending **empty** (whitespace-only) messages.
- As a **chat user**, I must see **incoming messages in real time** without page reloads.
- As a **chat user**, I must see **my messages** visually distinct from **others’ messages**.

---

## Emojis & GIFs

- As a **chat user**, I must be able to insert **emojis** via picker and native keyboard.
- As a **chat user** I must be able to select gif from gif picker
- As a **chat user**, I must be able to send **GIFs** (via GIF picker).
- As a **chat user**, I must see **GIFs autoplay** (muted/looping) inside the message bubble.
- As a **chat user**, when I type double colon and emoji name, emoji dropdown should appear
- As a **chat user**, when I click on emoji from emoji dropdown, emoji should be selected
- As a **chat user**, when I send emoji, it should be parsed and shown correctly

---

## Photos & Media Uploads (S3 specifics)

- As a **chat user**, I must be able to **attach photos** from my device and send them.
- As a **chat user**, I must see an **upload progress indicator** for media.
- As a **chat user**, I must be **blocked** from uploading files that exceed the **configured size limit**.
- As a **chat user**, I must be **blocked** from uploading **unsupported MIME types** (e.g., executables), with an error message.
- As a **chat user**, uploaded images must be **processed** by sharp (e.g., resized to max dimensions, optimized, and metadata stripped).
- As a **chat user**, uploaded images must be stored in S3 under the expected **key pattern**.
- As a **chat user**, when viewing the chat, images must display with correct **aspect ratio**, with an option to **open full-size**
- As a **non-member**, I must **not** be able to access media objects via S3
- As a **chat user**, I can upload only up to maximum number of images

---

## Avatars & User Presence

- As a **chat user**, I must see each participant’s **profile photo or avatar** next to their messages.
- As a **chat user**, I must see a **fallback avatar** (e.g., initials) if no profile photo exists.
- As a **chat user**, I should see **typing indicators**
- As a **chat user**, I should see **online/offline** status (if available).

---

## Profile Interaction

- As a **chat user**, I must be able to **click on another participant’s profile photo or name** to open their **profile view**.

---

## Timestamps & Grouping

- As a **chat user**, I must see a **timestamp** on each message in my local timezone.
- As a **chat user**, I must see **date separators** (e.g., “Today”, “Yesterday”).
- As a **chat user**, I must see **message grouping** by sender/time to reduce repeated avatars/timestamps.

---

## Message Ordering & Scrolling

- As a **chat user**, I must be able to **scroll to the latest messages**
- As a **chat user**, I must be able to **scroll to the oldest messages** via infinite scroll/pagination.
- As a **chat user**, when I’m reading older messages and a new message arrives, my **scroll position must not jump**;

---

## Deletion & Permissions (no admins)

- As a **chat user**, I must be able to **delete the chat/conversation** **only if I’m a participant**
- As a **chat user**, I must **not** be able to delete a chat I’m not a participant of.

---

## Notifications (optional)

- As a **chat user**, I must receive **in-app** notifications for new messages in other chats.
- As a **chat user**, I must not receive **in-app** notifications for new messages in chat that I currently have opened on my screen

---

## Security & Privacy (S3 + sockets)

- As a **chat user**, S3 objects must be **private**; media access is only returned to authorized participants.
- As a **chat user**, uploads must be validated for **MIME type** and **size** server-side before S3 write (multer-s3 filters).
- As a **chat user**, images must be **sanitized/processed** (sharp) to mitigate malicious payloads and remove EXIF data.

---

## Minimal Accessibility (acknowledged low priority)

- As a **keyboard user**, I should be able to **focus** the input and **send** a message (e.g., Enter key).

> Note: Full WCAG compliance and screen reader semantics are intentionally **out of scope** for now.

## AWS Rekognition

- See file `Chat_Uploads_Rekognition.md`
