# Testing Guidelines

## Cypress E2E

- Use Cypress E2E tests for user-visible flows across routes, forms, navigation, API states, and socket-driven UI. Do not assert React internals, hook state, implementation class names, or styling details unless the style is the user-visible behavior.
- Keep each spec deterministic and independent. Clear browser state before login setup, seed the Auth0 Cypress user explicitly, and mock backend data with `cy.intercept`.
- Do not use real Auth0 login. Use the Cypress Auth0 shim by setting `duga:cypress-auth-user` and, when session bootstrap is not under test, `duga:cypress-skip-session-start`.
- Do not hit real backend APIs from E2E tests. Add intercepts for every route request that the page can trigger, including supporting navigation requests such as notifications, uploads, comments, forum data, and online status.
- Do not hit real sockets. In Cypress, assert emitted socket events through `window.__dugaCypressSocketEvents`.
- Do not hit real Stripe. If premium or billing is implemented later, mock checkout, subscription, customer portal, and webhook-adjacent API responses. Tests must assert app navigation and UI behavior without leaving Duga or opening Stripe-hosted pages.
- Prefer `data-testid` selectors for important controls and states that tests depend on. Use accessible roles, labels, and visible text when they are stable product copy. Avoid Tailwind classes, DOM nesting, and generated IDs.
- Use fixtures from `cypress/fixtures` for shared users, profiles, chats, messages, uploads, comments, notifications, premium state, and error responses. Override fixture data inside an individual test only when that scenario requires it.
- Keep commands in `cypress/support/commands.ts` small and composable. Commands should set up auth/session defaults, common API intercepts, selector helpers, and socket assertions, not hide important test behavior.
- Favor happy paths plus one or two important failure paths per feature. Avoid duplicating unit test coverage in Cypress.

## Naming

- Spec files should be named by user behavior, for example `protected-routes.cy.ts`, `users-and-profiles.cy.ts`, and `chat-flows.cy.ts`.
- Test names should describe the behavior from the user's perspective.
- Fixture names should describe the domain object, not the spec that uses them.

## Required Mocks

- Auth/session: `POST /register`, `POST /sessions/start`, `GET /users/current-user`.
- Users/profile: `GET /users/get-users`, `GET /users/:id`, `GET /users/online-status`, profile photos and user uploads.
- Chat/messages: `GET /chats`, `POST /chats/create`, `GET /chats/messages`, `POST /messages/read-message`, `GET /messages/is-read`.
- Shared navigation: `GET /notifications`, `GET /uploads/latest`, `GET /comments/latest`, and forum endpoints touched by the current route.

## Verification

- Run focused Cypress specs after E2E changes.
- Run linter diagnostics for edited source and support files.
- If a full Cypress run is not possible locally, document the reason and the focused checks that did run.
