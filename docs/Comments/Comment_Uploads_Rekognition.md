# COMMENT_UPLOADS_REKOGNITION_TESTS.md

> Manual test checklist for AWS Rekognition moderation on images attached to profile photo comments.

---

## Scope

- Applies to images attached through the profile photo comment composer.
- Does not apply to text-only comments or GIF URLs selected from Giphy unless product policy adds GIF moderation.
- Moderation must run before a comment image is persisted or made visible to other users.
- Comment text should remain available to the user if an attached image is blocked.

---

## Happy Path

- As a **user**, when I attach a clean image to a comment, the system must scan it with AWS Rekognition DetectModerationLabels.
- As a **user**, if the image passes moderation, the comment must be created successfully.
- As a **user**, the accepted image must be stored privately in S3.
- As a **user**, the accepted image must be displayed through authorized secure/blob access.
- As a **viewer**, the successful comment must arrive through the normal API/socket path.
- As a **viewer**, the image must not distort the comment card layout.

---

## Blocked Content

- As a **user**, explicit, sexual, suggestive, or otherwise policy-blocked content at/above the configured threshold must be blocked.
- As a **user**, blocked images must not be stored permanently in S3.
- As a **user**, if an image was staged before moderation, it must be deleted immediately after block.
- As a **user**, the comment must not be created with the blocked image.
- As a **viewer**, no `receive-comment`/comment-created socket event should expose a blocked image.
- As a **user**, I must see a clear toast explaining that the image cannot be uploaded.
- As a **user**, my typed comment text should remain so I can retry without the blocked image.

---

## Failure Modes

- As a **user**, if Rekognition times out, the upload must fail closed.
- As a **user**, if Rekognition returns an API error, the upload must fail closed.
- As a **user**, if moderation cannot verify the image, I must see a retry-later message.
- As a **user**, if network upload fails, I must see an error toast.
- As a **user**, if file type validation fails before upload, Rekognition should not be called.
- As a **user**, if upload fails after local preview, pending preview state must be cleared or made retryable.

---

## File Constraints

- As a **user**, only configured image types may be uploaded.
- As a **user**, unsupported file types must be blocked client-side and server-side.
- As a **user**, image uploads must respect the product max image count.
- As a **system**, accepted images should be processed with sharp to resize/compress and strip EXIF metadata.
- As a **system**, filenames should be normalized to avoid spaces/dashes and unsafe characters.

---

## Real-Time Consistency

- As a **viewer**, blocked images must never briefly appear in the comment thread.
- As a **viewer**, successful image comments must appear consistently after API and socket updates.
- As a **viewer**, duplicate socket events must not create duplicate comments after a successful image upload.
- As a **comment author**, failed moderation must not leave a ghost comment in my local list.

---

## Security & Privacy

- As a **system**, moderation and upload endpoints must require a valid authenticated app session.
- As a **system**, moderation decisions should be logged with labels, confidence, user ID, upload/comment context, and timestamp.
- As a **system**, blocked image bytes must not be retained in logs.
- As a **non-owner/non-viewer**, I must not be able to fetch comment image objects directly from S3.
- As a **system**, presigned/secure URLs must only be issued to authorized users.

---

## QA Scenarios

- Clean portrait image passes and appears in a comment.
- Clean screenshot/image passes if allowed by MIME and policy.
- Explicit/nudity sample is blocked and never appears.
- Suggestive borderline sample below threshold follows product policy.
- GIF file or unsupported file type is rejected according to configured file type rules.
- Oversized or max-count-exceeding upload is blocked before moderation where possible.
- Rekognition timeout/error fails closed with a retry-later message.
- Network disconnect during upload shows error and recovers on refresh.
