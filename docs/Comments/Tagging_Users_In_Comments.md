## User Tagging in Profile Photo Comments

### Tagging Flow

- As a **user**, I must be able to **tag other users** in a comment on a profile photo by typing `@` followed by the first letters of their username.
- As a **user**, when I type `@` and at least one letter, I must see a **dropdown list** of users whose names start with the typed letters.
- As a **user**, the dropdown must **filter in real time** as I type more characters.

### Rendering

- As a **user**, when I tag someone, their mention (`@DisplayName`) must be **highlighted in blue** in the posted comment.
- As a **user**, the highlight must be visible both for me and for others viewing the comment.
- As a **user**, clicking on a highlighted tagged name must take me to that user’s **profile page**.

### Notifications

- As a **tagged user**, I must receive an **in-app notification** when I’m tagged in a profile photo comment.
- As a **tagged user**, clicking the notification must bring me to the **profile photo comment thread** where I was tagged.

### Real-Time & Sockets

- As a **viewer of a profile photo**, when someone tags a user in a comment, I must see the new comment in **real time** (via socket, e.g., `profilePhoto.comment.created`).
- As a **tagged user**, if I am currently online, I must also see my **notification appear in real time** without refreshing.

### Editing & Deletion

- As a **comment author**, I must be able to **edit my comment text**, including removing or adding tags.
- As a **comment author**, I must be able to **delete my comment** — when deleted, the **tags and associated notifications** must also be removed.
- As a **tagged user**, if I was tagged in a comment that later gets deleted, I must **no longer see the tag or the notification**.

### Constraints

- As a **user**, I must not be able to tag a user that does not exist.
- As a **user**, I must not be able to tag myself in my own comment
- As a **user**, if I start typing `@` but do not select a valid user, the text must remain plain text and not become a link.
