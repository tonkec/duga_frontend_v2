# AUTH_TESTS.md

> Manual test cases for **Auth0 authentication**, Duga backend user creation, email verification, onboarding, route guards, logout, and app-session enforcement.
> Locale: hr-HR (Croatian). Auth provider: Auth0.

---

## 0) Preconditions & Test Accounts

- Tester has access to an Auth0 tenant configured for the app environment.
- The app has valid Auth0 domain, client ID, callback URL, and audience values.
- The backend supports `/register`, `/sessions/start`, `/users/current-user`, `/users/post-login`, and `/send-verification-email`.
- Test accounts should include a new unverified user, a verified user without onboarding, a verified onboarded user, a social-login user if enabled, and a user with a revoked app session.
- Browser local storage, session storage, cookies, and Auth0 state should be cleared before first-run tests unless a test requires persisted state.

---

## 1) Public Routes & Landing Page

**AUTH-001 Login page is public**

- **Given** I am not authenticated
- **When** I open `/login`
- **Then** I see the Duga landing page
- **And** I see at least one **Prijavi se** action
- **And** no protected user data is requested before login

**AUTH-002 Public policy pages**

- **Given** I am not authenticated
- **When** I open `/cookie-policy`, `/privacy-policy`, or `/terms-of-use`
- **Then** the page opens without redirecting to Auth0

**AUTH-003 Verify-email route requires an authenticated user**

- **Given** I am not authenticated
- **When** I open `/verify-email`
- **Then** I am redirected to `/login`

**AUTH-004 Unknown route does not expose protected content**

- **Given** I am not authenticated
- **When** I open an unknown route
- **Then** I see the app not-found behavior or am redirected safely
- **And** protected content is not visible

---

## 2) Auth0 Login Redirect

**AUTH-010 Login button starts Auth0**

- **Given** I am on `/login`
- **When** I click **Prijavi se**
- **Then** the app calls Auth0 login with redirect URI set to the current app origin
- **And** the Auth0 `appState.returnTo` target is `/post-login`

**AUTH-011 Login clears previous revoked marker**

- **Given** my previous app session was revoked
- **When** I click **Prijavi se**
- **Then** the revoked-session marker is cleared before starting Auth0 login
- **And** I should not be blocked by stale session state after successful login

**AUTH-012 Auth0 callback navigates to app state**

- **Given** Auth0 redirects back to the app after successful login
- **When** the callback is handled
- **Then** the app navigates to the Auth0 `returnTo` path when present
- **And** it falls back to the current path when `returnTo` is missing

**AUTH-013 Missing Auth0 configuration**

- **Given** Auth0 environment configuration is missing
- **When** the app loads
- **Then** the app shows **Configuration for auth0 is missing!**
- **And** protected authentication flows cannot continue

---

## 3) Email/Password Login

**AUTH-020 Successful database login**

- **Given** I have a valid Auth0 email/password account
- **When** I log in with the correct credentials
- **Then** Auth0 authenticates me
- **And** the app registers or ensures my backend user
- **And** the app starts a Duga session
- **And** I am routed according to verification and onboarding state

**AUTH-021 Wrong password**

- **Given** I have an Auth0 account
- **When** I enter the wrong password
- **Then** Auth0 keeps me unauthenticated
- **And** I remain outside protected Duga routes
- **And** I see the Auth0-hosted error message

**AUTH-022 Unknown email**

- **Given** I do not have an account for the entered email
- **When** I attempt login
- **Then** Auth0 does not authenticate me
- **And** Duga must not create an authenticated app session

**AUTH-023 Browser back after login**

- **Given** I successfully logged in
- **When** I use the browser back button to return to the Auth0/login step
- **Then** I must not be able to create an inconsistent duplicate app session
- **And** protected routes still depend on the current active session state

---

## 4) Signup & Backend User Creation

**AUTH-030 New user signup through Auth0**

- **Given** I do not have an account
- **When** I sign up through Auth0
- **Then** Auth0 creates the identity
- **And** Duga calls `/register` with Auth0 ID, email, generated username, and email verification state

**AUTH-031 Register creates or reuses backend user**

- **Given** I log in with an Auth0 identity
- **When** Duga calls `/register`
- **Then** a backend user is created if missing
- **And** an existing backend user is reused if already present
- **And** duplicate backend users are not created for the same Auth0 ID

**AUTH-032 Generated username fallback**

- **Given** my Auth0 profile does not provide an app username
- **When** Duga ensures my backend user
- **Then** the app sends a generated username using the local fallback pattern
- **And** I can later choose my own username in the post-login form

**AUTH-033 Register stores session ID**

- **Given** `/register` returns a session ID
- **When** Duga receives the response
- **Then** the session ID is stored locally as the app session ID
- **And** future app-session requests use that session ID

**AUTH-034 Register failure**

- **Given** Auth0 login succeeds
- **When** backend `/register` fails
- **Then** the app must not treat the user as fully ready
- **And** the user sees an error state or is routed safely
- **And** protected data must not render with a missing backend user

---

## 5) Social Login

**AUTH-040 Google/social login**

- **Given** social login is enabled in Auth0
- **When** I log in with Google or another enabled provider
- **Then** Auth0 authenticates me through that provider
- **And** Duga creates or reuses the backend user
- **And** the same email verification and onboarding rules apply

**AUTH-041 First-time social consent**

- **Given** I am using a social provider for the first time
- **When** the provider asks for consent
- **Then** I can approve the requested scopes
- **And** Duga receives the expected Auth0 user profile after redirect

**AUTH-042 Social account with unverified email**

- **Given** a social provider returns an unverified email
- **When** I return to Duga
- **Then** I am treated as unverified
- **And** I am routed to `/verify-email`

---

## 6) Email Verification

**AUTH-050 Unverified user blocked from protected routes**

- **Given** I am authenticated
- **And** Auth0 or backend user state says my email is not verified
- **When** I open a protected onboarded route
- **Then** I am redirected to `/verify-email`

**AUTH-051 Verify email page content**

- **Given** I am authenticated but unverified
- **When** I open `/verify-email`
- **Then** I see **Potvrdi svoju e-mail adresu**
- **And** I see explanatory text saying a verification link was sent
- **And** I see my email address when Auth0 provides it
- **And** I see **Natrag na login** and **Ponovno pošalji e-mail**

**AUTH-052 Verified user cannot stay on verify-email page**

- **Given** I am authenticated and verified
- **When** I open `/verify-email`
- **Then** I am redirected to `/`

**AUTH-053 Resend verification email success**

- **Given** I am authenticated but unverified
- **And** the backend current user has an ID
- **When** I click **Ponovno pošalji e-mail**
- **Then** Duga posts to `/send-verification-email` with my user ID
- **And** I see success toast **E-mail je uspješno poslan.**
- **And** the button shows **Šaljem...** while the request is pending

**AUTH-054 Resend verification email failure**

- **Given** I am authenticated but unverified
- **When** sending the verification email fails
- **Then** I see error toast **Došlo je do greške prilikom slanja e-maila.**
- **And** the page remains usable for retry

**AUTH-055 Resend disabled without backend user ID**

- **Given** I am authenticated but the backend user ID is not available
- **When** I view `/verify-email`
- **Then** **Ponovno pošalji e-mail** is disabled
- **And** clicking resend must not call the endpoint

**AUTH-056 Returning after email verification**

- **Given** I clicked the verification link from my email
- **When** I return to Duga and Auth0/backend verification state is updated
- **Then** I can proceed past `/verify-email`
- **And** I am routed to onboarding if onboarding is incomplete
- **And** I am routed to the app if onboarding is complete

---

## 7) App Session Start & Single Active Session

**AUTH-060 App session starts after Auth0 login**

- **Given** Auth0 has authenticated me
- **When** Duga initializes the app session
- **Then** Duga calls `/sessions/start`
- **And** it sends the Auth0 access token as bearer authorization
- **And** it sends `x-duga-session-id`
- **And** it stores the returned Duga API token when present

**AUTH-061 Missing Auth0 access token**

- **Given** Auth0 reports an authenticated user
- **When** the app cannot resolve an Auth0 access token
- **Then** `/sessions/start` fails with an unauthenticated error
- **And** protected app usage must not continue as an active Duga session

**AUTH-062 One active session policy**

- **Given** I am logged in on Device A
- **When** I log in with the same account on Device B
- **Then** Device B becomes the active session
- **And** Device A is revoked or logged out according to backend session policy

**AUTH-063 Revoked session event**

- **Given** my current app session is revoked
- **When** Duga receives or detects session revocation
- **Then** React Query cached data is cleared
- **And** Duga session ID/API token data is cleared
- **And** I see toast **Odjavljeni ste jer je račun otvoren u drugoj sesiji.**
- **And** Auth0 logout is triggered with return target set to the app origin

**AUTH-064 Session conflict API response**

- **Given** any API returns session conflict/revoked code or `/sessions/start` returns conflict
- **When** the global error handler receives it
- **Then** the app marks the session revoked
- **And** it does not continue normal protected-route rendering

**AUTH-065 Reload with active session**

- **Given** I am logged in with an active Duga session
- **When** I refresh the app
- **Then** Auth0 state is restored from local storage
- **And** Duga validates/starts the app session
- **And** protected routes become available after loading completes

**AUTH-066 Reload with revoked session marker**

- **Given** session storage marks the app session as revoked
- **When** I reload the app
- **Then** the app session status is revoked
- **And** protected routes redirect to `/login`
- **And** stale protected data is not visible

---

## 8) Onboarding / Post-Login Form

**AUTH-070 First verified login opens onboarding**

- **Given** I am authenticated and verified
- **And** my backend user has `onboarding_done = false`
- **When** I finish Auth0 login
- **Then** I am routed to `/post-login`
- **And** I see **Još par detalja prije ulaska**

**AUTH-071 Onboarded user bypasses onboarding**

- **Given** I am authenticated, verified, and already onboarded
- **When** I open `/post-login`
- **Then** I am redirected to `/`

**AUTH-072 Non-onboarded user cannot use onboarded routes**

- **Given** I am authenticated and verified
- **And** `onboarding_done = false`
- **When** I open `/`, `/profile`, `/users`, `/new-chat`, `/settings`, `/notifications`, or `/forum`
- **Then** I am redirected to `/post-login`

**AUTH-073 Username validation**

- **Given** I am on `/post-login`
- **When** I enter a username shorter than 3 characters
- **Then** I see **Korisničko ime mora imati barem 3 znaka.**
- **When** I enter more than 32 characters
- **Then** I see **Korisničko ime može imati najviše 32 znaka.**
- **When** I enter characters outside letters, numbers, `_`, and `.`
- **Then** I see **Dopuštena su slova, brojevi, _ i .**

**AUTH-074 Age validation**

- **Given** I am on `/post-login`
- **When** I leave age empty or non-numeric
- **Then** I see **Unesi svoju dob brojem.**
- **When** I enter a decimal age
- **Then** I see **Dob mora biti cijeli broj.**
- **When** I enter an age below 18
- **Then** I see **Moraš imati najmanje 18 godina.**
- **When** I enter an age above 110
- **Then** I see **Dob ne može biti veća od 110 godina.**

**AUTH-075 Required policy acceptance**

- **Given** I am on `/post-login`
- **When** I do not accept the privacy policy
- **Then** I see **Moraš prihvatiti Politiku privatnosti.**
- **When** I do not accept the rules/terms
- **Then** I see **Moraš prihvatiti Pravila upotrebe.**

**AUTH-076 Continue button disabled until valid**

- **Given** I am on `/post-login`
- **When** any required field is invalid or unchecked
- **Then** **Nastavi** is disabled
- **And** the form cannot be submitted

**AUTH-077 Successful onboarding**

- **Given** I provide a valid username and age
- **And** I accept privacy policy and terms
- **When** I submit the form
- **Then** Duga posts to `/users/post-login`
- **And** the button shows **Spremam...** while pending
- **And** I see success toast **Uspješno spremljeni podaci!**
- **And** I am redirected to `/`

**AUTH-078 Onboarding API error**

- **Given** I submit valid onboarding data
- **When** the backend returns a validation or server error
- **Then** I see toast beginning with **Greška:**
- **And** the backend message is shown when available
- **And** I remain on `/post-login` with the form available for correction/retry

---

## 9) Authenticated Navigation & Logout

**AUTH-090 Navigation waits for current user**

- **Given** I am authenticated and onboarded
- **When** the main navigation loads
- **Then** I see a loader until current-user data is available
- **And** the navigation uses my backend username/avatar where available

**AUTH-091 Logout action**

- **Given** I am authenticated
- **When** I click logout from navigation
- **Then** Duga attempts to set my online status offline when a socket is available
- **And** Duga clears the app session ID
- **And** Duga clears app session revoked state
- **And** Auth0 logout is called with `returnTo` set to the app origin

**AUTH-092 Access after logout**

- **Given** I logged out
- **When** I open protected routes directly
- **Then** I am redirected to `/login`
- **And** protected data from the previous user is not visible

**AUTH-093 Logout without socket**

- **Given** I am authenticated but the socket is unavailable
- **When** I logout
- **Then** logout still completes
- **And** the app does not block on setting offline status

---

## 10) Token & Storage Behavior

**AUTH-100 Auth0 cache location**

- **Given** I log in successfully
- **When** I inspect browser storage
- **Then** Auth0 state is stored according to Auth0 local storage cache behavior
- **And** Duga does not manually store Auth0 credentials outside Auth0 SDK storage

**AUTH-101 Duga session ID**

- **Given** I have an active app session
- **When** I inspect local storage
- **Then** there is a Duga app session ID
- **And** it is cleared on normal logout or session revocation

**AUTH-102 Duga API token**

- **Given** `/sessions/start` returns a Duga API token
- **When** the response is handled
- **Then** the token is stored through the app token helper
- **And** it is cleared on session conflict/revocation or logout

**AUTH-103 Revoked state isolation**

- **Given** a session is revoked
- **When** Duga stores revoked state
- **Then** revoked markers live in session storage
- **And** a fresh login flow clears stale revoked state

---

## 11) Global API Error Handling

**AUTH-110 Session conflict handled globally**

- **Given** an API response indicates `SESSION_REVOKED` or `SESSION_CONFLICT`
- **When** the global error handler runs
- **Then** only app API token/session data is cleared
- **And** Auth0 state is not manually corrupted
- **And** Duga marks the session revoked

**AUTH-111 Server error**

- **Given** an authenticated API request returns 500 or higher
- **When** the global error handler runs
- **Then** the app redirects to `/broken`
- **And** repeated redirects must not occur if already on an error route

**AUTH-112 Not found error**

- **Given** an authenticated API request returns 404
- **When** the global error handler runs
- **Then** the app redirects to `/record-not-found`

**AUTH-113 Network error**

- **Given** an authenticated API request fails with network error
- **When** the global error handler runs
- **Then** the app clears only app API token data
- **And** redirects to `/network-error`

**AUTH-114 Skipped global handler**

- **Given** an API request sets `skipGlobalErrorHandler`
- **When** the request fails
- **Then** the local caller handles the failure
- **And** global redirects are not triggered

---

## 12) Password Reset

> Password reset is hosted by Auth0. Verify through the Auth0 Universal Login flow configured for the tenant.

**AUTH-120 Request password reset**

- **Given** I am not authenticated
- **When** I choose forgot-password/reset-password in Auth0
- **Then** Auth0 accepts the request
- **And** Duga does not reveal whether the email exists

**AUTH-121 Registered email reset**

- **Given** I enter a registered email
- **When** I submit the reset request
- **Then** I receive a password reset email
- **And** the reset link opens the secure Auth0 reset flow

**AUTH-122 Unregistered email reset**

- **Given** I enter an unregistered email
- **When** I submit the reset request
- **Then** I see a generic Auth0 response
- **And** user enumeration is not possible

**AUTH-123 New password policy**

- **Given** I open the Auth0 reset form
- **When** I enter a weak password
- **Then** Auth0 enforces tenant password policy
- **When** I enter a valid password
- **Then** the reset succeeds

**AUTH-124 Login after reset**

- **Given** I reset my password
- **When** I log in with the new password
- **Then** login succeeds
- **And** the old password no longer works
- **And** Duga starts a new app session

---

## 13) Security & Privacy

- As an **unauthenticated user**, I must never receive protected user, chat, notification, forum, upload, or settings data.
- As an **unverified user**, I must not access onboarded/protected routes until verification state is true.
- As a **non-onboarded user**, I must not access onboarded routes until `/users/post-login` succeeds.
- As a **logged in user**, all protected API calls must include the required Auth0/Duga session credentials.
- As a **logged in user**, backend authorization must enforce user identity even if the frontend route guard is bypassed.
- As a **logged in user**, session revocation must clear cached data so another user cannot see stale content on the same browser.
- As a **tester**, verify that login, logout, session conflict, and verification flows do not leak tokens in URLs, logs, or visible UI.

---

## 14) Accessibility, UX & Localization

- Login, verify-email, onboarding, and navigation logout controls must be keyboard reachable.
- Loading states must be visible while Auth0, current-user, and session requests are pending.
- Auth pages and onboarding validation messages must be in Croatian, except Auth0-hosted pages controlled by tenant configuration.
- Buttons that submit network requests must show pending state or be disabled while the request is in progress.
- Error toasts must be readable and not hide required form controls.
- Auth pages must work on mobile, tablet, and desktop layouts.

---

## 15) Regression Checklist

- Fresh unverified signup routes to `/verify-email`.
- Fresh verified signup routes to `/post-login`.
- Completed verified account routes to `/`.
- Direct protected-route access while logged out redirects to `/login`.
- Direct onboarded-route access before onboarding redirects to `/post-login`.
- Direct `/post-login` access after onboarding redirects to `/`.
- Direct `/verify-email` access after verification redirects to `/`.
- Logout clears app session state and blocks protected routes.
- Second login for the same account revokes the old active session.
- Session conflict from any protected API logs out or blocks the stale session.
- Password reset through Auth0 allows login only with the new password.
