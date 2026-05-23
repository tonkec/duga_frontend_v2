# SETTINGS_PAGE_TESTS.md

> Manual test cases for **Postavke** (Settings) page.  
> Scope: Online status (radio), Reject cookies, Delete profile.
> Locale: **hr-HR** (Croatian). Auth required.

---

## 0) Preconditions

- User is authenticated and viewing **/postavke** for **their own account**.
- Network is available unless a test explicitly simulates failures.
- Toast/notification component is available in the app.

---

## 1) Access & Layout

**ST-001 Access control**

- **Given** I am **not logged in**
- **When** I navigate to **/postavke**
- **Then** I am redirected to **/login**, auth0 flow

**ST-002 Owner-only access**

- **Given** I’m logged in as **User A**
- **When** I try to open **User B’s** settings
- **Then** I am redirected to Dashboard

**ST-003 Basic UI**

- **Given** I open **/postavke**
- **Then** I see title **“Postavke”**, description **“Odaberi svoj trenutni online status.”**
- **And** I see two radio options:
  - **“Želim biti online”**
  - **“Želim biti offline”**
- **And** I see buttons: **“Odbij kolačiće”**, **“Obriši svoj profil”**

**ST-004 Localization**

- **Given** I open the page
- **Then** all labels/buttons are in **Croatian** (no stray English strings)

---

## 2) Online Status (Presence)

**ST-010 Default selection reflects server state**

- **Given** my current presence on server is **offline**
- **When** I open settings
- **Then** radio **“Želim biti offline”** is **selected**

**ST-011 Switch to online**

- **Given** I’m on the page with **offline** selected
- **When** I select **“Želim biti online”**
- **Then** I get a **success toast**
- **And** server presence becomes **online**
- **And** my presence appears **online** to other users

**ST-012 Switch to offline**

- Same as ST-011 but toggling to **offline** and verifying server presence = **offline**

**ST-013 Persistence across reload**

- **Given** I switched to **online**
- **When** I refresh the page / re-login
- **Then** radio shows **online** selected (persisted)

**ST-014 Socket propagation**

- **Given** another user is viewing my profile/chat list
- **When** I toggle **online ↔ offline**
- **Then** the other user sees my status update **in real time** (no page reload)

**ST-015 Network failure**

- **Given** I toggle to **online**
- **When** the **status API** returns **500 / timeout**
- **Then** I see an **error toast** “Nije uspjelo spremanje statusa”
- **And** the radio **reverts** to the previous selection

**ST-016 Auth failure**

- **Given** my session expires
- **When** I toggle status
- **Then** I’m prompted to **re-auth** or redirected to **login**, and change is **not saved**

---

## 3) Reject Cookies

> Define expected behavior for your app.

**ST-020 Button visible and enabled**

- **Given** I open settings
- **Then** I see **“Odbij kolačiće”** button enabled

**ST-021 Reject cookies action**

- **Given** optional/analytics cookies have been previously accepted
- **When** I click **“Odbij kolačiće”**
- **Then** analytics/marketing cookies are **cleared/disabled**
- **And** consent state is updated to **rejected**
- **And** I see a **success toast** “Postavke kolačića su ažurirane”

**ST-022 Idempotency**

- **Given** consent is already **rejected**
- **When** I click **“Odbij kolačiće”** again
- **Then** nothing breaks; I may see a neutral toast or no-op, and cookies remain disabled

**ST-023 Persistence**

- **Given** I rejected cookies
- **When** I refresh / return later
- **Then** consent remains **rejected** and no cookies are created

**ST-024 Network/Storage error**

- **When** local storage or consent API fails
- **Then** I see an **error toast** and previous consent state is **unchanged**

---

## 4) Delete Profile

> Dangerous action—usually requires confirmation + re-auth. Also verify data cleanup (e.g., S3 media, messages) per your product’s policy.

**ST-030 Button visible and styled as destructive**

- **Given** I open settings
- **Then** I see **“Obriši svoj profil”** button (destructive style)

**ST-031 Confirmation modal**

- **When** I click **“Obriši svoj profil”**
- **Then** a modal appears with:
  - Clear warning text (Croatian)
  - **Cancel** and **Confirm delete** actions

**ST-032 Confirm deletion (happy path)**

- **Given** confirmation modal is open
- **When** I confirm deletion
- **Then** I see a **success toast** “Profil je obrisan”
- **And** I am **signed out**
- **And** I’m redirected to **home/landing**
- **And** my account data is deleted/anonymized per policy

**ST-033 Cancel deletion**

- **When** I click **Cancel** on the modal
- **Then** no deletion occurs; modal closes

**ST-034 Backend failure**

- **When** delete API returns **4xx/5xx**
- **Then** I see an **error toast** and **remain logged in**; no partial logout

**ST-035 Data cleanup (integration)**

- **When** deletion completes
- **Then** associated resources are cleaned up per policy (e.g., **S3 user photos**, presigned URLs invalidated, presence removed)
- **And** no orphaned data is accessible

---

## 5) UI/UX & Responsiveness

**ST-036 Consistent selection styles**

- **Then** selected radio shows an active state; other is unselected; keyboard navigation works (Tab / Arrow / Space)

**ST-037 Toast behavior**

- **Then** success/error toasts appear within 1–2s, auto-dismiss (or closeable), and don’t overlap controls

**ST-038 Responsive layout**

- **When** viewport changes (mobile/tablet/desktop)
- **Then** the card, radios, and buttons stay readable and not clipped

---

## 6) Security

**ST-050 CSRF/JWT enforcement**

- **When** posting status/cookies/delete requests
- **Then** requests require valid **JWT/session/CSRF**; unauthenticated attempts are rejected

**ST-051 No elevation**

- **Given** I attempt to call the settings APIs for another user
- **Then** I receive **403** and no changes are applied

---

## 7) Analytics/Logging (if enabled)

**ST-060 Telemetry**

- **When** I toggle status, reject cookies, or confirm deletion
- **Then** events are logged **without** storing sensitive data

---

## 8) Visual Regression (optional)

**ST-070 Snapshot**

- **Then** header “Postavke”, help text, radio group, and two buttons render consistently across releases

---

## 9) Negative/Edge Cases

**ST-080 Double-click protection**

- **When** I rapidly click any action (status change / reject cookies / delete)
- **Then** duplicate requests are throttled; final state remains correct

**ST-081 Offline mode**

- **When** I am offline and try any action
- **Then** I get an **offline error toast**; nothing persists until retry

**ST-082 Expired session**

- **When** I leave the page open and session expires
- **Then** first action triggers **re-auth** or redirect; no silent failure
