/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
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
const apiToken = 'cypress-api-token';

const setupAuthenticatedUser = () => {
  cy.clearLocalStorage();
  cy.clearCookies();

  cy.intercept('POST', '**/register', {
    statusCode: 201,
    body: currentUser,
  }).as('register');

  cy.intercept('POST', '**/sessions/start', {
    statusCode: 201,
    body: { active: true },
  }).as('startSession');

  cy.intercept('GET', '**/users/current-user/**', {
    statusCode: 200,
    body: currentUser,
  }).as('getCurrentUser');

  cy.intercept('GET', '**/users/online-status/**', {
    statusCode: 200,
    body: { status: 'online' },
  });

  cy.intercept('GET', '**/uploads/profile-photo/**', {
    statusCode: 404,
    body: {},
  });

  cy.intercept('GET', '**/notifications/**', {
    statusCode: 200,
    body: [],
  });

  cy.setCookie('cookieAccepted', 'true');
  cy.setCookie('token', 'cypress-access-token');
  cy.visit('/settings', {
    onBeforeLoad(win) {
      win.localStorage.clear();
      win.sessionStorage.clear();
      (win as typeof win & { __dugaCypressAuthUser?: typeof authUser }).__dugaCypressAuthUser =
        authUser;
      win.localStorage.setItem('duga:cypress-auth-user', JSON.stringify(authUser));
      win.localStorage.setItem('duga:cypress-skip-session-start', 'true');
      win.localStorage.setItem('dugaSessionId', sessionId);
      win.localStorage.setItem('dugaApiToken', apiToken);
      win.document.cookie = 'token=cypress-access-token;path=/';
    },
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
});
