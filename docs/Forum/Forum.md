# FORUM_TESTS.md

> Manual test cases for **Forum** questions, answers, voting, media, and real-time updates.
> Locale: hr-HR (Croatian). Auth and completed onboarding required.

---

## Access & Navigation

- As an **unlogged user**, I must be redirected to **login** if I open **/forum**, **/forum/ask**, or a question details page.
- As a **logged in onboarded user**, I must be able to open **/forum** and see **Pitanja zajednice**.
- As a **user**, I must be able to click **Postavi pitanje** and open **/forum/ask**.
- As a **user**, I must be able to open a question from the list and return to the forum with **Povratak na forum**.
- As a **user**, invalid question IDs must show an error state instead of a broken page.

---

## Question List, Search & Filters

- As a **user**, I must see forum questions as cards with title, author, category, status, created date, answer count, and vote score.
- As a **user**, I must be able to search questions using **Pretraži pitanja...**.
- As a **user**, I must be able to filter by **category** when categories are available.
- As a **user**, I must be able to open **advanced filters** and filter by title, author, minimum answer count, and time range.
- As a **user**, I must be able to sort by newest, oldest, author A-Z/Z-A, and answer count.
- As a **user**, invalid filter values must show a Croatian validation message and must not update the URL query.
- As a **user**, I must be able to clear active filters with **Očisti filtere**.
- As a **user**, I must be able to page through forum results with **Prethodna** and **Sljedeća**.
- As a **user**, an empty unfiltered forum must invite me to be the first person to post a question.
- As a **user**, an empty filtered result must explain that no questions match the criteria and offer clearing filters.

---

## Creating Questions

- As a **user**, I must be able to create a question with title and description.
- As a **user**, I must be prevented from submitting a question without a title or description.
- As a **user**, the title must be at least 5 characters and at most 120 characters.
- As a **user**, the description must be at least 10 characters and must respect the forum body character limit.
- As a **user**, I must see a live character count for the description.
- As a **user**, I must be able to tag users by typing **@** in the description.
- As a **user**, I must be able to insert emojis from the emoji picker.
- As a **user**, typing **:** followed by an emoji name must show emoji suggestions and replace the token when selected.
- As a **user**, I must be able to attach up to 5 images, each up to 1 MB.
- As a **user**, selected images must show previews before submit and can be removed before submit.
- As a **user**, unsupported or oversized images must show a validation error and block submit.
- As a **user**, I must be able to attach one GIF from Giphy and remove it before submit.
- As a **user**, a successful question submit must navigate to the new question details page.
- As a **user**, API failures must show a Croatian error message and keep the form available for retry.

---

## Question Details

- As a **user**, I must see the question title, body, author, created date, category, status, media, and vote score.
- As a **user**, tagged users must render as profile links where possible.
- As a **user**, attached images must render in the question media gallery.
- As a **user**, GIF and YouTube links in text must render through the content formatter.
- As a **non-owner**, I must be able to upvote or downvote a question.
- As a **user**, clicking the same vote again must clear my vote.
- As a **question owner**, I must see the score but must not be able to vote on my own question.
- As a **question owner**, I must be able to edit the question title, body, tags, GIF/text content, and images.
- As a **question owner**, I must be able to delete an existing question image.
- As a **question owner**, I must be able to delete the question only after confirming in a modal.
- As a **non-owner**, I must not see owner-only edit/delete actions.
- As a **user**, I must be able to report a question from the actions menu.

---

## Answers

- As a **user**, I must be able to add an answer with text, image, emoji, GIF, and user tags.
- As a **user**, I must not be able to submit an empty answer unless it contains a GIF or image.
- As a **user**, answer text must be at least 2 characters when text is provided.
- As a **user**, answer text and answer images must follow the same body/image limits as forum content.
- As a **user**, submitted answers must appear in the answer list.
- As a **user**, I must be able to sort answers by newest or oldest.
- As a **user**, if a question has an accepted answer, I must be able to sort with **Prihvaćeni prvo**.
- As a **user**, answer pagination must show 5 answers per page when enough answers exist.
- As a **question owner**, I must be able to mark one answer as accepted.
- As a **question owner**, I must be able to remove the accepted-answer state.
- As an **answer owner**, I must be able to edit or delete my answer.
- As an **answer owner**, I must be able to replace or remove answer images.
- As a **non-owner**, I must not see owner-only edit/delete actions for another user's answer.
- As a **user**, I must be able to report an answer from the actions menu.

---

## Replies & Reactions

- As a **user**, I must be able to reply to an answer from the answer actions menu.
- As a **reply owner**, I must be able to edit and delete my reply.
- As a **user**, replies must be collapsible when an answer has replies.
- As a **user**, I must be able to react to answers with the predefined emoji reactions.
- As a **user**, I must be able to remove my reaction by selecting the same reaction again.
- As a **user**, reaction counts must update after adding or removing a reaction.
- As a **user**, I must be able to react to replies from the reply reaction menu.
- As an **unavailable or expired session user**, reaction and reply actions must fail gracefully with an error state or re-auth flow.

---

## Real-Time & Error Behavior

- As a **user**, newly created or updated forum content should update through forum socket events without requiring a full page reload where supported.
- As a **user**, loading states must be shown while questions or question details are being fetched.
- As a **user**, list/detail fetch failures must show a Croatian error message and not leave an empty broken layout.
- As a **user**, double-clicking submit/action buttons must not create duplicate questions, answers, votes, or reactions.

---

## Security & Access Control

- As a **user**, I must only be able to edit or delete my own questions, answers, and replies.
- As a **user**, question owner-only actions such as accepting answers must be enforced server-side.
- As a **user**, image uploads must be validated server-side for file type, size, and count.
- As a **user**, media URLs must only expose content allowed by the forum privacy rules.
- As a **user**, all forum create/update/delete/vote/reaction requests must require a valid authenticated session.
