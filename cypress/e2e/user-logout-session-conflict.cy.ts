/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
  publicId: 'user-cypress-logout',
  username: 'cypress_logout',
  age: '30',
  onboarding_done: true,
  isVerified: true,
  status: 'online',
};

const authUser = {
  sub: 'auth0|cypress-logout-user',
  email: 'cypress-logout@example.com',
  email_verified: true,
  name: 'Cypress Logout User',
};

const sessionId = 'cypress-logout-session';

const setupAuthenticatedUser = () => {
  cy.clearLocalStorage();
  cy.clearCookies();

  cy.mockAuthenticatedSession({ authUser, currentUser });

  cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: currentUser,
  }).as('getCurrentUser');

  cy.intercept('GET', /\/users\/online-status\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { status: 'online' },
  });

  cy.intercept('GET', /\/uploads\/profile-photo\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: {},
  });

  cy.intercept('GET', /\/notifications\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: [],
  });

  cy.visitAsAuthenticated('/settings', { authUser });
  cy.window().then((win) => {
    win.localStorage.setItem('dugaSessionId', sessionId);
  });
};

describe('logout and session conflict handling', () => {
  it('logs the user out from the app navigation', () => {
    setupAuthenticatedUser();

    cy.contains('h1', 'Postavke').should('be.visible');
    cy.get('button[aria-label="Odjava"]').click();

    cy.location('pathname').should('eq', '/login');
    cy.contains('Prijavi se').should('be.visible');
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'duga:cypress-auth-user')
      .should('be.null');
  });

  it('redirects to login when the backend revokes the app session', () => {
    setupAuthenticatedUser();

    cy.intercept('DELETE', '**/delete-user', {
      statusCode: 401,
      body: {
        code: 'SESSION_REVOKED',
        message: 'Session has been opened somewhere else.',
      },
    }).as('deleteUserSessionConflict');
    cy.contains('h1', 'Postavke').should('be.visible');
    cy.contains('button', 'Obriši profil').click();
    cy.contains('button', 'Potvrđujem').click();

    cy.wait('@deleteUserSessionConflict');
    cy.location('pathname').should('eq', '/login');
    cy.contains('Odjavljeni ste jer je račun otvoren u drugoj sesiji.').should('be.visible');
    cy.getCookie('token').should('be.null');
  });

  it('logs the user out when the socket reports a session opened elsewhere', () => {
    setupAuthenticatedUser();

    cy.contains('h1', 'Postavke').should('be.visible');
    cy.receiveSocketEvent('session-revoked');

    cy.location('pathname').should('eq', '/login');
    cy.contains('Odjavljeni ste jer je račun otvoren u drugoj sesiji.').should('be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('duga:cypress-auth-user')).to.equal(null);
      expect(win.localStorage.getItem('dugaSessionId')).to.equal(null);
      expect(win.sessionStorage.getItem('dugaApiToken')).to.equal(null);
      expect(win.sessionStorage.getItem('dugaCsrfToken')).to.equal(null);
    });
  });
});
