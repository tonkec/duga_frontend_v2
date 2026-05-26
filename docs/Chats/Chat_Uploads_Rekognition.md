# CHAT_UPLOADS_REKOGNITION_TESTS.md

> Manual test checklist for AWS Rekognition moderation on images attached to chat messages.

---

## Scope

- Applies to images attached to one-to-one and group chat messages.
- Applies before image messages are persisted, broadcast, or made visible to chat members.
- Does not apply to text-only messages.
- GIF picker URLs should follow separate Giphy/content rules unless product policy adds GIF moderation.
- All behavior must respect chat membership and cookie-consent gating.

---

## Happy Path

- As a **chat member**, when I attach a clean image to a message, the system must scan it with AWS Rekognition DetectModerationLabels.
- As a **chat member**, if no blocked labels are found above threshold, the upload must succeed.
- As a **chat member**, the accepted image must be processed, stored privately, and rendered in the message bubble.
- As a **chat member**, clean image messages must appear in real time for other members through sockets.
- As a **chat member**, the image must keep a safe aspect ratio and be openable full-size where supported.
- As a **chat member**, image messages must appear correctly in chat previews/recent messages.

---

## Blocked Content

- As a **chat member**, explicit, sexual, suggestive, or otherwise blocked content at/above threshold must be rejected.
- As a **chat member**, blocked files must not be stored permanently in S3.
- As a **chat member**, if a file was staged before moderation, it must be deleted immediately after block.
- As a **chat member**, no message record should be created for a blocked image.
- As a **chat member**, no socket event should broadcast blocked content.
- As a **chat member**, I must see a clear toast explaining that the photo cannot be uploaded.
- As a **chat member**, my text input should remain available so I can retry without the blocked image.

---

## Failure Modes

- As a **chat member**, Rekognition timeout must fail closed.
- As a **chat member**, Rekognition API errors must fail closed.
- As a **chat member**, if moderation cannot verify the image, I must see a retry-later error.
- As a **chat member**, network upload failure must show an error toast.
- As a **chat member**, unsupported file type or file-size failures must block upload before moderation where possible.
- As a **chat member**, failed moderation/upload must not leave a pending ghost message in the thread.

---

## File Processing

- As a **system**, accepted images should be resized/compressed and have EXIF metadata stripped.
- As a **system**, accepted image objects must be private.
- As a **system**, object keys should use the expected environment/chat/message path convention.
- As a **system**, files rejected by MIME, size, count, or moderation should not be processed further.
- As a **system**, moderation should run independently for each image when multiple image uploads are supported.

---

## Real-Time & Group Chat Consistency

- As a **one-to-one chat member**, clean image messages must appear for both participants.
- As a **group chat member**, clean image messages must appear for all current group members.
- As a **new group member**, if product policy allows full history visibility, previously accepted images in history must be visible.
- As a **removed group member**, I must not receive or fetch future chat image messages.
- As a **non-member**, I must not access chat image URLs by guessing or reusing direct S3 links.

---

## Cookie Consent

- As a **user who rejected cookies**, I must not be able to access chat image upload flows.
- As a **user who rejected cookies**, deep-linked chat pages must be blocked before upload controls are usable.
- As a **user who later accepts cookies**, chat image upload flows should work again after refresh/session recovery.

---

## Security & Privacy

- As a **system**, upload and moderation endpoints must require a valid authenticated app session.
- As a **system**, chat membership must be checked server-side before accepting uploads.
- As a **system**, moderation decisions should be logged with labels, confidence, user ID, chat ID, and timestamp.
- As a **system**, blocked image bytes must not be retained in logs.
- As a **system**, secure/presigned URLs must only be issued to authorized chat members.

---

## QA Scenarios

- Clean image in one-to-one chat passes and broadcasts.
- Clean image in group chat passes and broadcasts to all members.
- Explicit/nudity sample is blocked and never broadcasts.
- Suggestive borderline sample below threshold follows product policy.
- Unsupported MIME type is rejected before moderation.
- Oversized image is rejected before or during upload according to backend limits.
- Rekognition timeout/error fails closed.
- Network disconnect during upload shows error and leaves the chat usable.
- Removed/non-member user cannot fetch a previously shared chat image.
