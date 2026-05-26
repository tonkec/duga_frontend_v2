# NOTIFICATIONS_PAGE_TESTS.md

> Manual test cases for **Obavijesti** page and real-time notification updates.
> Locale: hr-HR (Croatian). Auth and completed onboarding required.

---

## Access & Layout

- As an **unlogged user**, I must be redirected to **login** if I open **/notifications**.
- As a **logged in user**, I must see the page label **Obavijesti** and title **Najnovije aktivnosti**.
- As a **user**, I must see **Označi sve kao pročitano** in the page header.
- As a **user**, the page layout must remain usable on mobile, tablet, and desktop.

---

## Loading & Empty States

- As a **user**, I must see **Učitavanje obavijesti...** while notifications are loading.
- As a **user**, if I have no notifications, I must see **Nema obavijesti**.
- As a **user**, the empty state must explain that new messages and activities will appear here.
- As a **user**, loading and empty states must not show stale notification rows.

---

## Notification List

- As a **user**, I must see all notifications returned for my account.
- As a **user**, unread notifications must be visually distinct from read notifications.
- As a **user**, notification rows must preserve the same behavior as notification items in navigation.
- As a **user**, clicking a notification must navigate to the expected target when the notification supports navigation.
- As a **user**, I must not see notifications that belong to another user.

---

## Mark All As Read

- As a **user**, if I have unread notifications, **Označi sve kao pročitano** must be enabled.
- As a **user**, clicking **Označi sve kao pročitano** must mark all visible notifications as read immediately.
- As a **user**, after all notifications are read, the button must become disabled.
- As a **user**, the read state must persist after refreshing the page.
- As a **user**, if the mark-all request fails, the app should recover by refetching or showing the correct persisted state.

---

## Real-Time Updates

- As a **user**, when a **new_notification** socket event arrives, the new notification must appear at the top of the list.
- As a **user**, when a **markAsRead** socket event arrives, the matching notification must update to read.
- As a **user**, socket updates must not duplicate existing notification rows.
- As a **user**, leaving the page must unsubscribe from notification socket listeners.

---

## Security & Edge Cases

- As a **user**, notification requests must require a valid authenticated session.
- As a **user**, expired sessions must redirect to login or show the global auth flow instead of silently failing.
- As a **user**, malformed or unknown socket payloads must not break the notifications page.
- As a **user**, rapid repeated clicks on **Označi sve kao pročitano** must not create inconsistent read states.
