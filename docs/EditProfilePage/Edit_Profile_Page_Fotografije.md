# EDIT_PROFILE_FOTOGRAFIJE_REKOGNITION_TESTS.md

> User-story style manual test checklist for **profile photo uploads** on the **Fotografije** tab with **AWS Rekognition** moderation.  
> Stack: React SPA, Auth0 (user identity), Socket.IO (optional live gallery refresh), **AWS S3** (multer-s3 + sharp).  
> Scope: **Only the profile owner** can manage photos.

---

## Assumptions

- S3 objects are **private**
- Images are processed with **sharp** (resize, compress, strip EXIF) **only after** passing moderation.
- Moderation uses **AWS Rekognition — DetectModerationLabels** with a configurable **block threshold** (e.g., **≥ 90%**).

---

## Access Control

- As a **logged in user**, I must be able to upload/delete photos **only on my own profile** (Fotografije tab).
- As a **logged in user**, I must be **blocked** (toast) if I try to change another user’s photos (via URL/API).
- As an **unlogged user**, I must be redirected to **login** if I try to access the Fotografije editor.

---

## Happy Path — Clean Image

- As a **profile owner**, when I select an image, I should see a **local blob preview** immediately (e.g., `blob:https://<domain>/<uuid>`).
- As a **profile owner**, the image is **scanned** by Rekognition **before** S3 persistence.
- If **no explicit content** is found at/above threshold, the upload **succeeds**, image is processed by **sharp**, stored in **S3 (private)**, and the gallery updates
- I must see a **success toast**

---

## Blocked Content — Explicit/Nudity/Sexual

- As a **profile owner**, if Rekognition flags **Explicit Nudity / Sexual Activity / Sexual Content / Suggestive** at or above threshold, the upload must be **blocked**.
- I must see an **error toast**
- The file must **not** be stored in S3 (or be **immediately deleted** if staged).
- **No** gallery item should appear
- My **local preview** must **disappear** after the block, leaving the form intact so I can choose another image.

---

## Failure Modes & Safety

- As a **profile owner**, if Rekognition **times out or errors**, the system must **fail closed**: block the upload and show a toast:  
  _“We couldn’t verify this photo right now. Please try again later.”_
- If **network upload fails** or the file **exceeds size limits / unsupported MIME**, I must see a **clear toast**, and the pending file is **cleared**.
- Sharp processing failures must show a **toast**, and the file must **not** be saved.

---

## Sizing, Formats, and Processing

- As a **profile owner**, oversized images must be **downscaled** (max pixel dimension) and **compressed** via sharp.
- **EXIF metadata** must be **stripped** to protect privacy (location, device).
- Allowed formats: **JPEG/PNG/WebP/GIF** (per product). Others must be **rejected** with a toast.

---

## Gallery UX

- As a **profile owner**, I must see the **new photo** appear in my gallery after a successful upload (presigned URL).
- Other viewers of my profile should see the new photo on reload, no sockets here
- As a **profile owner**, I must be able to **delete a photo**:
  - The photo must be removed from the gallery **immediately**
  - The **S3 object must be deleted**.
  - The photo’s **optional description** must also be **deleted**.
  - A **success toast** must appear
- If deletion fails, the UI must **roll back** and show an **error toast**.

---

## Profile Photo Selection (Primary)

- As a **profile owner**, I must be able to **select one photo as my profile photo** (primary).
- As a **profile owner**, I must **not** be able to select more than one profile photo at a time.
- As a **profile owner**, when I change my profile photo selection, the update must be **saved in real time** and show a **success toast**.
- As a **viewer**, I must see the correct profile photo displayed across the platform.

---

## Photo Descriptions

- As a **profile owner**, I must be able to add an **optional description** to each uploaded photo.
- As a **profile owner**, descriptions must support **text, emojis, and links**
- As a **viewer**, I must see the photo description when browsing someone’s profile.
- As a **profile owner**, if I **delete a photo**, its description must also be **deleted** automatically.

---

## Multiple Uploads & Limits

- As a **profile owner**, I must be able to **select multiple files** for upload at once.
- As a **profile owner**, I must be limited to a **maximum number of images**
- As a **profile owner**, if I try to upload beyond the max limit, I must see a **toast**
- As a **profile owner**, if multiple uploads are allowed, each file must be **moderated and processed independently**.

---

## Security & Storage

- As a **system**, do not persist any file that **fails moderation**.
- As a **system**, store accepted images in **private S3**
- As a **system**, rate-limit upload attempts to prevent abuse.
- As a **system**, log moderation decisions (**labels + confidences + userId + timestamp**) without storing the blocked image.

---

## Edge Cases

- **Borderline content** below threshold must follow policy
- Re-uploading the **same blocked image** must still be blocked consistently.
- If a photo is **set as profile photo** from the gallery, it must already have passed moderation
- **Multiple concurrent uploads**: each file moderated independently

---

## QA Configuration Hints

- Set Rekognition block threshold to **≥ 90%** for explicit/sexual/suggestive labels.
- Test set:
  - ✅ Clean portrait — passes, can be set as profile photo, description editable.
  - ❌ Explicit sample — blocked with toast; nothing saved.
  - ❌ GIF with explicit first frame — blocked with toast.
  - ❌ Rekognition timeout — blocked with “verify later” toast.
  - ❌ Unsupported format / oversize — blocked with descriptive toast.
  - ❌ Upload more than max allowed — blocked with toast.
