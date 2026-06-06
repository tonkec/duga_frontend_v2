/// <reference types="cypress" />

export {};

describe('protected routes', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('redirects unauthenticated visitors to login', () => {
    cy.intercept('GET', '**/users/current-user**', {
      statusCode: 401,
      body: { message: 'Not authenticated' },
    }).as('getCurrentUserUnauthorized');

    cy.intercept('POST', '**/sessions/start', {
      statusCode: 401,
      body: { message: 'Not authenticated' },
    }).as('startSessionUnauthorized');

    cy.visit('/users');

    cy.location('pathname').should('eq', '/login');
    cy.contains('Prijavi se').should('be.visible');
  });

  it('allows authenticated onboarded users to open the users page', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('users').then((users) => {
        cy.mockAuthenticatedSession({ currentUser });
        cy.mockDefaultApi({ users });

        cy.visitAsAuthenticated('/users');

        cy.getByTestId('users-page').should('be.visible');
        cy.contains('Pronađi korisnike').should('be.visible');
        cy.getByTestId('user-card').should('have.length', 2);
      });
    });
  });
});
