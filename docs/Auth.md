# Auth0 Authentication Flow — Manual Testing User Stories

## Public Access

- As an **unlogged in user**, I must be able to access the **home page**.
- As an **unlogged in user**, I must be able to access the **login page**.
- As an **unlogged in user**, I must **not** be able to access the **dashboard** (or any protected route).

---

## Login — Database User

- As an **unlogged in user**, I must be able to log in using **email + password**.
- As a **logged in user**, I must be redirected back to the application with my **profile info** available.
- As a **logged in user**, I must see **restricted pages** (e.g., dashboard).
- As a **non logged in user**, I must use the **correct credentials** to successfully log in.
- As a **non logged in user**, if I use **incorrect credentials** (wrong email or password), I must not be logged in and must see an error message.
- As an **unlogged in user**, I must be able to log in using **email + password**.

---

## Signup

- As an **unlogged in user**, I must be able to sign up for a new account from the login page.
- As a **newly signed up user**, I must be logged in automatically or prompted to verify my email .

---

## Logout

- As a **logged in user**, I must be able to log out from the app.
- After logout, I must be redirected to the **public home page**.
- After logout, I must **not** be able to access dashboard page or chat page or any other protected page until I log in again.

---

## Social Login (Google Example)

- As an **unlogged in user**, I must be able to log in with **Google**.
- As a **first-time social user**, I must be prompted to grant access.
- As a **social user**, I must see my profile info correctly populated in the app.

---

## Post-Login Form

- As a **first-time logged in user**, I must see the **post-login form** immediately after login.
- As a **first-time logged in user**, I must be required to complete all mandatory fields before proceeding.
- As a **first-time logged in user**, I must be redirected to the **dashboard** only after submitting the form successfully.
- As a **first-time logged in user**, I must see error messages if I try to submit the form with missing/invalid data.
- As a **returning user** who already completed the form, I must **not** see the post-login form again.
- As a user coming from social login, I must follow the same rules for the post login form

---

## Session Management

- As a **logged in user**, I must not be able to stay logged in on multiple sessions simultaneously.
- As a **logged in user**, when I log in on a new device/browser, my previous session must be invalidated.
- As a **logged in user**, when I log out in one tab/device, my other active sessions must also be terminated
- As an **unlogged in user**, I must be redirected to the **login page** if I try to use an expired/terminated session.

## Reset Password Flow

- As an **unlogged in user**, I must be able to request a **password reset** from the login page.
- As an **unlogged in user**, when I enter a registered email, I must receive a **reset password email**.
- As an **unlogged in user**, when I enter an unregistered email, I must see a **generic message** (e.g., “If this account exists, we’ll send you an email”) to prevent user enumeration.
- As an **unlogged in user**, when I click the reset password link, I must be taken to a **secure reset form** hosted by Auth0.
- As an **unlogged in user**, I must be required to enter a **new password** that meets the tenant’s password policy (e.g., length, complexity).
- As an **unlogged in user**, after successfully resetting my password, I must be able to log in with the **new password**.
- As an **unlogged in user**, after resetting my password, my **old password must no longer work**.
- As a **logged in user**, I must be able to reset my password from the **profile or settings page** (if the app exposes that option).
- As a **logged in user**, after resetting my password, I must be logged out from all other active sessions (if tenant settings enforce this).

## Error & Edge Cases

- As an **unverified user**, I must be prevented from logging in
- As an **unverified user**, I must see verification page
