/// <reference types="cypress" />

type DugaAuthUser = {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
};

type DugaBackendUser = {
  id: number;
  publicId?: string;
  username: string;
  email?: string;
  age?: string | number;
  onboarding_done: boolean;
  isVerified?: boolean;
  status?: string;
  [key: string]: unknown;
};

type SocketEvent = {
  event: string;
  payload: Record<string, unknown>;
};

type MockAuthenticatedSessionOptions = {
  authUser?: DugaAuthUser;
  currentUser?: DugaBackendUser;
  skipSessionStart?: boolean;
};

type MockDefaultApiOptions = {
  users?: DugaBackendUser[];
  chats?: unknown[];
  uploads?: unknown[];
  latestUploads?: unknown[];
  latestComments?: unknown[];
  notifications?: unknown[];
  forumQuestions?: unknown[];
};

const isDocumentNavigation = (req: { headers: Record<string, string | string[] | undefined> }) => {
  const acceptHeader = req.headers.accept;
  const accept = Array.isArray(acceptHeader) ? acceptHeader.join(',') : acceptHeader ?? '';
  return accept.includes('text/html');
};

const DEFAULT_AUTH_USER: DugaAuthUser = {
  sub: 'auth0|cypress-user',
  email: 'cypress-user@example.com',
  email_verified: true,
  name: 'Cypress User',
};

const DEFAULT_BACKEND_USER: DugaBackendUser = {
  id: 1,
  publicId: 'user-current',
  username: 'cypress_user',
  email: 'cypress-user@example.com',
  age: 30,
  onboarding_done: true,
  isVerified: true,
  status: 'online',
};

const seedAuthenticatedStorage = (
  win: Window,
  authUser: DugaAuthUser = DEFAULT_AUTH_USER,
  skipSessionStart = true
) => {
  (win as Window & { __dugaCypressE2E?: boolean }).__dugaCypressE2E = true;
  win.localStorage.setItem('duga:cypress-auth-user', JSON.stringify(authUser));
  win.localStorage.setItem('dugaSessionId', 'cypress-session');
  if (skipSessionStart) {
    win.localStorage.setItem('duga:cypress-skip-session-start', 'true');
  } else {
    win.localStorage.removeItem('duga:cypress-skip-session-start');
  }
  win.sessionStorage.setItem('dugaAuth0AccessToken', 'cypress-access-token');
  win.sessionStorage.setItem('dugaCsrfToken', 'cypress-csrf-token');
};

Cypress.Commands.add('getByTestId', (testId, options) => {
  return cy.get(`[data-testid="${testId}"]`, options);
});

Cypress.Commands.add('loginAs', (authUser = DEFAULT_AUTH_USER, options = {}) => {
  cy.window({ log: false }).then((win) => {
    seedAuthenticatedStorage(win, authUser, options.skipSessionStart);
  });
});

Cypress.Commands.add('visitAsAuthenticated', (url, options = {}) => {
  const { authUser = DEFAULT_AUTH_USER, skipSessionStart = true, ...visitOptions } = options;
  const originalOnBeforeLoad = visitOptions.onBeforeLoad;

  return cy.visit(url, {
    ...visitOptions,
    onBeforeLoad(win) {
      seedAuthenticatedStorage(win, authUser, skipSessionStart);
      if (originalOnBeforeLoad) {
        originalOnBeforeLoad(win);
      }
    },
  });
});

Cypress.Commands.add('mockAuthenticatedSession', (options = {}) => {
  const {
    currentUser = DEFAULT_BACKEND_USER,
    skipSessionStart = true,
  }: MockAuthenticatedSessionOptions = options;

  cy.intercept('POST', '**/register', {
    statusCode: 201,
    body: currentUser,
  }).as('register');

  cy.intercept('POST', '**/sessions/start', {
    statusCode: 201,
    body: { csrfToken: 'cypress-csrf-token' },
  }).as('startSession');

  cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: currentUser,
  }).as('getCurrentUser');

  cy.intercept('GET', /\/users\/online-status\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { status: currentUser.status ?? 'online' },
  });

  cy.intercept('GET', '**/uploads/profile-photo/*', {
    statusCode: 200,
    body: {},
  }).as('getProfilePhoto');

  cy.intercept('GET', '**/uploads/user/*', {
    statusCode: 200,
    body: { images: [] },
  }).as('getUserUploads');

  cy.intercept('GET', '**/messages/is-read*', {
    statusCode: 200,
    body: { is_read: true },
  }).as('getIsMessageRead');

  cy.intercept('POST', '**/messages/read-message*', {
    statusCode: 200,
    body: {},
  }).as('markMessageAsRead');

  cy.setCookie('cookieAccepted', 'true');

  if (!skipSessionStart) {
    cy.log('Session bootstrap is enabled for this test.');
  }
});

Cypress.Commands.add('mockDefaultApi', (options = {}) => {
  const {
    users = [],
    chats = [],
    uploads = [],
    latestUploads = [],
    latestComments = [],
    notifications = [],
    forumQuestions = [],
  }: MockDefaultApiOptions = options;

  cy.intercept('GET', /\/users\/get-users\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: users,
  }).as('getUsers');

  cy.intercept('GET', '**/chats', {
    statusCode: 200,
    body: chats,
  }).as('getChats');

  cy.intercept('GET', /\/uploads\/profile-photo\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: {},
  });

  cy.intercept('GET', /\/uploads\/user\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { images: uploads },
  });

  cy.intercept('GET', /\/uploads\/user-photos\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: uploads,
  });

  cy.intercept('GET', /\/uploads\/latest\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: latestUploads,
  });

  cy.intercept('GET', /\/comments\/latest\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: latestComments,
  });

  cy.intercept('GET', /\/notifications\/?(?:\?.*)?$/, (req) => {
    if (isDocumentNavigation(req)) {
      req.continue();
      return;
    }

    req.reply({
      statusCode: 200,
      body: notifications,
    });
  });

  cy.intercept('GET', /\/forum\/questions\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: forumQuestions, pagination: { page: 1, totalPages: 1 } },
  });
});

Cypress.Commands.add('assertSocketEvent', (eventName, expectedPayload = {}) => {
  cy.window()
    .its('__dugaCypressSocketEvents')
    .should((events: SocketEvent[] | undefined) => {
      const matchingEvent = events?.find((event) => event.event === eventName);

      expect(Boolean(matchingEvent), `socket event ${eventName}`).to.equal(true);
      expect(matchingEvent?.payload).to.deep.include(expectedPayload);
    });
});

Cypress.Commands.add('receiveSocketEvent', (eventName, payload) => {
  cy.window().then((win) => {
    const receiveSocketEvent = (
      win as Window & { __dugaCypressReceiveSocketEvent?: (event: string, payload?: unknown) => void }
    ).__dugaCypressReceiveSocketEvent;

    expect(Boolean(receiveSocketEvent), 'Cypress socket receiver').to.equal(true);
    receiveSocketEvent?.(eventName, payload);
  });
});

declare global {
  // Cypress custom command typing is exposed through its global namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getByTestId(
        testId: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
      ): Chainable<JQuery<HTMLElement>>;
      loginAs(
        authUser?: DugaAuthUser,
        options?: { skipSessionStart?: boolean }
      ): Chainable<void>;
      visitAsAuthenticated(
        url: string,
        options?: Partial<VisitOptions> &
          MockAuthenticatedSessionOptions
      ): Chainable<AUTWindow>;
      mockAuthenticatedSession(options?: MockAuthenticatedSessionOptions): Chainable<void>;
      mockDefaultApi(options?: MockDefaultApiOptions): Chainable<void>;
      assertSocketEvent(
        eventName: string,
        expectedPayload?: Record<string, unknown>
      ): Chainable<void>;
      receiveSocketEvent(eventName: string, payload?: unknown): Chainable<void>;
    }
  }
}

export {};