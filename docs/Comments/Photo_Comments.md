# CHAT_PHOTO_COMMENTS_TESTS.md

> User-story style manual test checklist for **photo comments** in chat.  
> Stack: **Socket.IO** (real-time), **AWS S3** (multer-s3 + sharp) for stored media, local previews via **blob:** URLs.  
> No admin roles.

---

## Create & View Comments

- As a **logged in user**, I must be able to **comment on my own photos**.
- As a **logged in user**, I must be able to **comment on other users’ photos**
- As a **logged in user**, I must be able to submit **text-only comments**.
- As a **logged in user**, I must be able to submit comments with **images**, **GIFs**, and **emojis**.
- As a **logged in user**, I must see each comment’s **commenter display name** and **comment text**.
- As a **logged in user**, media in comments must be **parsed/rendered** (images inline, GIFs autoplay/loop muted, links unfurl or show a safe preview, youtube links become iframes).

---

## Media Handling (Images/GIFs/Links)

- As a **logged in user**, when I attach an image to a new comment, I must see a **local preview** using a **blob:** URL of the form:  
  `blob:<domain>/<uuid>`
- As a **logged in user**, after upload, the server stores media in **S3** (private).
- As a **logged in user**, unsupported file types or files **exceeding size limits** must be **blocked** with a clear error toast.
- As a **logged in user**, image EXIF/metadata must be stripped and images resized/optimized via **sharp**.
- As a **non-member**, I must **not** be able to fetch comment media (no public S3 URLs; presigned only).
- As a **logged in user**, if I have more than maximum number of images, I must not be able to upload any more photos

---

## Pagination & Ordering

- As a **logged in user**, comments under a photo must be **paginated**.
- As a **logged in user**, I must be able to **load older comments** (e.g. prev and next buttons).
- As a **logged in user**, new comments appear **at the end** (chronological order)

---

## Real-Time (Sockets)

- As a **logged in user**, when someone posts a comment, I must see it **in real time** without reloading.
- As a **comment author**, when I **edit** my comment text, others must see the **updated text in real time**
- As a **comment author**, when I **delete** my comment, it must **disappear** in real time for everyone.

---

## Editing & Deleting (Author-only)

- As a **comment author**, I must be able to **edit my comment text**.
- As a **comment author**, if my comment **contains an image**, I must **not** be able to **edit the image** after posting (only text can be edited).
- As a **comment author**, I must be able to **delete my comment**.
- When a comment is deleted, its **images/GIFs/emojis and any associated media** must be **deleted/invalidated** (e.g., S3 object removed).
- As a **non-author**, I must **not** be able to edit or delete someone else’s comment.

---

## Emojis & Text

- As a **logged in user**, I must be able to insert **emojis** via picker and native keyboard into the comment input.
- As a **logged in user**, emojis must render at appropriate size/line height and not break wrapping.
- As a **logged in user**, I must be prevented from submitting **empty comments** (whitespace only).

---

## Links & Safety

- As a **logged in user**, pasted **links** in comments must be clickable
- As a **logged in user**, potentially unsafe links or large previews must be **sanitized** and not execute script content.

---

## Toasters & Feedback

- As a **logged in user**, any **action** (create, edit, delete, upload start/finish/fail) must show a **toast message** (success or error).

---

## Responsiveness

- As a **mobile user**, I must be able to **compose**, **attach media**, and **submit** comments comfortably
- As a **mobile user**, image previews and comment list must **resize** fluidly
- As a **desktop user**, the comments panel should use available width and keep media within **safe aspect ratios**.

---

## Security & Authorization

- As a **non-member**, I must **not** be able to create, read, edit, or delete comments
- As a **logged in user**, comment media must be stored **private** in S3; access only if I am logged in

---

## Error States

- As a **logged in user**, if image upload fails (network/size/MIME), I must see an **error toast** and the pending media must be **cleared**.
- As a **logged in user**, if editing fails (conflict/permission), the text must **revert** and show an error toast.
- As a **logged in user**, if deletion fails (network/permission), the comment must **remain** and show an error toast.

---

## Data Model Constraints & Clean-up

- As a **logged in user**, each comment is associated with a **photo message ID** and a **unique comment ID**.
- As a **comment author**, deleting a comment must trigger **S3 cleanup** for its media
- As a **logged in user**, the system must prevent **dangling media** (no orphaned S3 files after deletion).

---

## Non-Goals / Explicit Constraints

- **Image editing for existing comments is not allowed.**
- Local preview must use **blob:** URL at `blob:https://staging--dugaprod.netlify.app/<uuid>` prior to upload.
- Full WCAG accessibility is **out of scope** right now (basic keyboard/contrast acceptable).

---

## Notifications

- As a **photo owner**, I must receive an **in-app notification** when another user comments on my photo.
- As a **photo owner**, the notification must show the **commenter’s name** and a **snippet** of the comment (e.g., first 50 chars).
- As a **photo owner**, if the comment contains media (image, GIF, link), the notification must display a **media icon/preview**.
- As a **photo owner**, notifications for new comments must arrive in **real time** (via Socket.IO event, e.g., `comment.notification`).
- As a **photo owner**, clicking the notification must take me directly to the **photo and its comments thread**.
- As a **non-owner**, I must **not** receive notifications for comments on photos that I did not upload.
- As a **photo owner**, I must be able to **mute notifications** for comments on a specific photo (if product supports it).
- As a **photo owner**, I must **not** receive duplicate notifications if a user edits their comment (notification should only trigger on **create**).
- As a **photo owner**, I must receive a **toast** or visible error if the notification fails to load or link correctly.

## Tagging users in photo comments

- See file `Tagging_Users_In_Comments.md`

## AWS Rekognition

- See file `Comment_Uploads_Rekognition.md`
