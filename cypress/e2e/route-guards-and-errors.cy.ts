/// <reference types="cypress" />

export {};

const ignoreExpectedAxiosStatus = (status: number) => {
  cy.on('uncaught:exception', (error) => {
    if (error.message.includes(`Request failed with status code ${status}`)) {
      return false;
    }
  });
};

describe('route guards and error states', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('redirects an authenticated unverified user to email verification', () => {
    cy.fixture('current-user').then((currentUser) => {
      const unverifiedAuthUser = {
        sub: 'auth0|cypress-unverified-user',
        email: 'unverified-cypress@example.com',
        email_verified: false,
        name: 'Unverified Cypress User',
      };
      const unverifiedBackendUser = {
        ...currentUser,
        email: unverifiedAuthUser.email,
        isVerified: false,
      };

      cy.mockAuthenticatedSession({ currentUser: unverifiedBackendUser });
      cy.mockDefaultApi();
      cy.intercept('POST', /\/send-verification-email\/?(?:\?.*)?$/, {
        statusCode: 200,
        body: { ok: true },
      }).as('sendVerificationEmail');

      cy.visitAsAuthenticated('/users', {
        authUser: unverifiedAuthUser,
      });

      cy.location('pathname').should('eq', '/verify-email');
      cy.contains('h1', 'Potvrdi svoju e-mail adresu').should('be.visible');
      cy.contains(unverifiedAuthUser.email).should('be.visible');

      cy.contains('button', 'Ponovno pošalji e-mail').click();
      cy.wait('@sendVerificationEmail');
      cy.contains('E-mail je uspješno poslan.').should('be.visible');
    });
  });

  it('redirects authenticated users who have not completed onboarding to post-login', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({
        currentUser: {
          ...currentUser,
          onboarding_done: false,
        },
      });
      cy.mockDefaultApi();

      cy.visitAsAuthenticated('/users');

      cy.location('pathname').should('eq', '/post-login');
      cy.contains('Još par detalja prije ulaska').should('be.visible');
    });
  });

  it('shows the not-found page for an unknown authenticated route', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi();

      cy.visitAsAuthenticated('/nepoznata-stranica');

      cy.contains('404').should('be.visible');
      cy.contains('Ova stranica ne postoji.').should('be.visible');
      cy.contains('Natrag na početnu').should('be.visible');
    });
  });

  it('shows dedicated record-not-found and network-error pages', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi();

      cy.visitAsAuthenticated('/record-not-found');
      cy.contains('Nije pronađeno').should('be.visible');
      cy.contains('Ova fotografija više nije dostupna.').should('be.visible');

      cy.visit('/network-error');
      cy.contains('Server nije dostupan').should('be.visible');
      cy.contains('Izgleda da se server srušio.').should('be.visible');
    });
  });

  it('redirects to the broken page when a guarded page receives a server error', () => {
    ignoreExpectedAxiosStatus(500);

    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi();
      cy.intercept('GET', /\/users\/get-users\/?(?:\?.*)?$/, {
        statusCode: 500,
        body: { message: 'Server error' },
      }).as('getUsersServerError');

      cy.visitAsAuthenticated('/users');

      cy.wait('@getUsersServerError');
      cy.location('pathname').should('eq', '/broken');
      cy.contains('Greška aplikacije').should('be.visible');
      cy.contains('Oh, ne! Nešto se potrgalo.').should('be.visible');
    });
  });

  it('redirects to record-not-found when a guarded page receives a not-found response', () => {
    ignoreExpectedAxiosStatus(404);

    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi();
      cy.intercept('GET', /\/users\/get-users\/?(?:\?.*)?$/, {
        statusCode: 404,
        body: { message: 'Not found' },
      }).as('getUsersNotFound');

      cy.visitAsAuthenticated('/users');

      cy.wait('@getUsersNotFound');
      cy.location('pathname').should('eq', '/record-not-found');
      cy.contains('Nije pronađeno').should('be.visible');
      cy.contains('Ova fotografija više nije dostupna.').should('be.visible');
    });
  });

  it('shows an empty users state when no verified users are available', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi({ users: [] });

      cy.visitAsAuthenticated('/users');

      cy.getByTestId('users-empty-state').should('be.visible');
      cy.contains('Nema dostupnih korisnika').should('be.visible');
      cy.contains('Trenutno nema drugih verificiranih profila za prikaz.').should('be.visible');
    });
  });
});
