## Image Moderation (AWS Rekognition)

### Scope

- Applies to **images** attached to **profile photo comments**.
- Moderation runs **before** any media is persisted or made visible to others.

### Happy Path

- As a **user**, when I attach an **image** to a comment, the system must **scan** it with **AWS Rekognition – DetectModerationLabels**.
- As a **user**, if the image is **clean**, the upload must proceed, the file is stored **privately in S3**, and the comment posts as usual

### Blocked Content

- As a **user**, if Rekognition flags **explicit content** (e.g., `Explicit Nudity`, `Sexual Activity`, `Sexual Content`, `Suggestive`) at or above the configured confidence threshold (e.g., **≥ 90%**), the upload must be **blocked**.
- As a **user**, when blocked, I must see a **toast message** explaining:  
  _“We couldn’t upload this image because it may contain explicit content.”_
- As a **user**, when blocked:
  - The file must **not** be stored in S3 (or immediately **deleted** if it was staged).
  - No **socket event** (`comment.created`) must be emitted.
  - The **comment is not created**; my typed **text remains** in the input so I can adjust it or remove the image.

### Failure Modes

- As a **user**, if moderation **fails** (timeout/API error), the system must **fail closed**: block the upload and show a toast:  
  _“We couldn’t verify this image right now. Please try again later.”_
- As a **user**, if my network upload fails, I must see an **error toast**, and the pending media must **clear**.

### Security & Storage

- As a **user**, images must only be stored **after** passing moderation; otherwise **discard** any temp files.
- As a **non-member**, I must **not** be able to access any moderated media (no public URLs).

### Real-time Consistency

- As a **viewer**, I must **never** see a blocked image appear in the thread.
- As a **viewer**, successful posts must still arrive **in real time** via sockets
