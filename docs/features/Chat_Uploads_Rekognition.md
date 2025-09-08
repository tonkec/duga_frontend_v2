# CHAT_FUNCTIONALITY_TESTS_S3.md

> User-story style manual test checklist for chat features using **Socket.IO** and **AWS S3** (multer-s3 + sharp).

...

## Security & Privacy (S3 + sockets)

- As a **chat user**, S3 objects must be **private**
- As a **chat user**, uploads must be validated for **MIME type** and **size** server-side before S3 write (multer-s3 filters).
- As a **chat user**, images must be **sanitized/processed** (sharp) to mitigate malicious payloads and remove EXIF data.

## Image Moderation (AWS Rekognition)

### Scope

- Applies to **images** attached to **chat messages**.
- Moderation runs **before** any media is persisted in S3 or broadcast via sockets.

### Happy Path

- As a **chat user**, when I attach an **image** to a chat message, the system must **scan** it with **AWS Rekognition – DetectModerationLabels**.
- As a **chat user**, if the media is **clean**, the upload must succeed, the file is stored **privately in S3**, and the message appears in chat with a **URL** for display.

### Blocked Content

- As a **chat user**, if Rekognition flags **explicit content** (e.g., `Explicit Nudity`, `Sexual Activity`, `Sexual Content`, `Suggestive`) at or above the configured confidence threshold (e.g., **≥ 90%**), the upload must be **blocked**.
- As a **chat user**, when blocked, I must see a **toast message** explaining:  
  _“We couldn’t upload this photo because it may contain explicit content.”_
- As a **chat user**, when blocked:
  - The file must **not** be stored in S3 (or deleted if staged).
  - No **socket event** (`message.created`) must be emitted.
  - The **message is not created**; my text input remains so I can adjust or remove the image.
- As a **chat user**, borderline results (below threshold) must **pass** (or follow your product policy; default here: **allow**).

### Failure Modes

- As a **chat user**, if moderation **fails** (timeout/API error), the system must **fail closed**: block the upload and show a toast:  
  _“We couldn’t verify this photo right now. Please try again later.”_
- As a **chat user**, if my network upload fails, I must see an **error toast** and the pending media must clear.

### Security & Storage

- As a **chat user**, images must only be persisted in S3 after passing moderation; otherwise discard temp files.
- As a **non-member**, I must **not** be able to access blocked or moderated content.

### Real-time Consistency

- As a **viewer in chat**, I must **never** see a blocked photo appear in the thread.
- As a **viewer in chat**, clean uploads must still appear **in real time** via sockets
