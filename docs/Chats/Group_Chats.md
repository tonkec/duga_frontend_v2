# GROUP_CHAT_TESTS.md

> Manual test cases for group chat creation, member management, mentions, search, and group-only permissions.
> Locale: hr-HR (Croatian). Auth and accepted cookies required.

---

## Starting Chats

- As a **user**, I must be able to open **Poruke** and click **Nova poruka**.
- As a **user**, I must be able to switch between **1 na 1** and **Grupa** modes.
- As a **user**, in **1 na 1** mode I must be able to search verified users by username.
- As a **user**, selecting a verified user in **1 na 1** mode must create a new chat or open an existing one if we already chatted.
- As a **user**, unverified users and my own user must not be selectable as chat partners.
- As a **user**, if cookies are rejected, the messages page must show the blocking notice and link to **Postavke**.

---

## Creating Group Chats

- As a **user**, in **Grupa** mode I must be able to enter a group name and select multiple verified users.
- As a **user**, I must be prevented from creating a group without a name.
- As a **user**, I must be prevented from creating a group with fewer than 2 selected members.
- As a **user**, I must not be able to select more than the maximum allowed group size.
- As a **user**, the UI must show how many more users can be selected for the group.
- As a **user**, selected users must be visually marked as **Odabrano**.
- As a **user**, clicking a selected user again must unselect that user.
- As a **user**, a successfully created group must notify selected users through the socket flow.
- As a **user**, a successfully created group must appear in my chat list with the group name.

---

## Chat List

- As a **user**, I must see chats sorted by latest message time, falling back to chat creation time.
- As a **user**, group chats must show a group title, participant names, and participant count.
- As a **user**, one-to-one chats must show the other user's username and latest message preview.
- As a **user**, empty chats without messages should not appear in the visible chat list.
- As a **user**, I must be able to click any visible chat and open its conversation.

---

## Group Header & Members

- As a **group chat member**, I must see the group name and total member count in the chat header.
- As a **group chat member**, I must see a **Članovi** section listing current members.
- As a **group chat member**, each member pill must link to that user's profile.
- As a **group chat member**, the header must show a group avatar/icon instead of a single user's avatar.
- As a **one-to-one chat user**, clicking the header avatar/name must navigate to the other user's profile.
- As a **group chat user**, clicking the group header must not navigate to another user's profile.

---

## Adding Members

- As a **group admin**, I must be able to click **Dodaj osobe** in a group chat.
- As a **one-to-one chat participant**, I must be able to click **Dodaj osobe** to convert or expand the conversation.
- As a **non-admin group member**, I must not see the **Dodaj osobe** action.
- As a **user**, the add-members modal must only list verified users who are not already members.
- As a **user**, I must be able to search users by username inside the add-members modal.
- As a **user**, I must be able to select one or more users before clicking **Dodaj odabrane**.
- As a **user**, adding members must respect the maximum group member limit.
- As a **user**, the modal must explain that new members can see the full conversation history.
- As a **user**, when new members are added, the member list and chat list must update without a page reload.
- As a **user**, newly added users must receive the group through the socket flow.

---

## Leaving & Deleting

- As a **group chat member**, I must be able to click **Izađi** and confirm leaving the group.
- As a **group chat member**, after leaving I must be redirected back to **Poruke** and the chat must be removed from my list.
- As a **group admin**, if I leave the group, admin ownership must transfer to the next eligible member.
- As a **user removed from a group**, I must be redirected away from that chat and local chat/member state must be cleared.
- As a **group admin**, I must be able to delete a group chat only after confirming in a modal.
- As a **non-admin group member**, I must not see the group delete action.
- As a **one-to-one chat participant**, I must be able to delete a conversation with messages after confirmation.
- As a **chat participant**, if another participant deletes the chat, I must be redirected to **Poruke** and see an informational toast.

---

## Message Search, Mentions & Reactions

- As a **chat user**, I must be able to search message text with **Pretraži tekst poruka...**.
- As a **chat user**, clearing the search input must restore all paginated messages.
- As a **chat user**, I must be able to mention only users who are members of the current chat.
- As a **chat user**, attempting to mention a non-member must show an error toast.
- As a **chat user**, I must be able to add and remove message reactions.
- As a **chat user**, reaction counts and my selected reaction state must update after socket events.
- As a **chat user**, reaction failures must show a Croatian error toast and refresh message data.

---

## Real-Time Behavior

- As a **chat user**, incoming messages must appear in the open chat in real time.
- As a **chat user**, typing indicators must appear when another member is typing.
- As a **chat user**, added or removed group members must update through socket events.
- As a **chat user**, online/offline status should update in one-to-one chats when status socket events are received.
- As a **chat user**, socket disconnects or missing sockets must disable actions that require real-time delivery.

---

## Security & Access Control

- As a **non-member**, I must not be able to open a group chat by direct URL.
- As a **non-admin**, I must not be able to add users to or delete a group chat through the API.
- As a **member**, I must not be able to add users beyond the maximum group member limit.
- As a **user**, create, add-member, leave, delete, message, mention, and reaction requests must require a valid authenticated session.
