/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
  publicId: 'user-cypress-signup',
  username: 'cypress_signup',
  onboarding_done: false,
  isVerified: true,
  status: 'online',
};

describe('user signup', () => {
  it('creates an account and completes onboarding', () => {
    let onboardingDone = false;
    let hasRegistered = false;

    cy.clearLocalStorage();
    cy.clearCookies();

    cy.intercept('POST', '**/register', (req) => {
      hasRegistered = true;
      req.reply({
        statusCode: 201,
        body: currentUser,
      });
    }).as('register');

    cy.intercept('POST', '**/sessions/start', {
      statusCode: 201,
      body: { csrfToken: 'cypress-csrf-token' },
    }).as('startSession');

    cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, (req) => {
      if (!hasRegistered) {
        req.reply({
          statusCode: 401,
          body: { message: 'Not authenticated' },
        });
        return;
      }

      req.reply({
        statusCode: 200,
        body: {
          ...currentUser,
          onboarding_done: onboardingDone,
        },
      });
    }).as('getCurrentUser');

    cy.intercept('POST', '**/users/post-login', (req) => {
      expect(req.body).to.deep.equal({
        data: {
          username: 'cypress_signup',
          age: 28,
          acceptPrivacy: true,
          acceptTerms: true,
        },
      });

      onboardingDone = true;

      req.reply({
        statusCode: 200,
        body: {
          ...currentUser,
          onboarding_done: true,
        },
      });
    }).as('completeOnboarding');

    cy.intercept('GET', /\/users\/get-users\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [],
    }).as('getUsers');

    cy.intercept('GET', /\/chats\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [],
    }).as('getChats');

    cy.intercept('GET', /\/uploads\/latest\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [],
    }).as('getLatestUploads');

    cy.intercept('GET', /\/comments\/latest\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [],
    }).as('getLatestComments');

    cy.intercept('GET', /\/notifications\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [],
    }).as('getNotifications');

    cy.intercept('GET', '**/uploads/profile-photo/*', {
      statusCode: 200,
      body: {},
    }).as('getProfilePhoto');

    cy.intercept('GET', '**/uploads/user/*', {
      statusCode: 200,
      body: { images: [] },
    }).as('getUserUploads');

    cy.intercept('GET', /\/forum\/questions\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: [], pagination: { page: 1, totalPages: 1 } },
    }).as('getForumQuestions');

    cy.setCookie('cookieAccepted', 'true');
    cy.visit('/login');
    cy.contains('button', 'Prijavi se').first().click();

    cy.wait('@register');
    cy.wait('@startSession');
    cy.location('pathname').should('eq', '/post-login');
    cy.contains('Još par detalja prije ulaska').should('be.visible');

    cy.get('input[name="username"]').type('cypress_signup');
    cy.get('input[name="age"]').type('28');
    cy.get('input[name="acceptPrivacy"]').check();
    cy.get('input[name="acceptTerms"]').check();
    cy.contains('button', 'Nastavi').should('be.enabled').click();

    cy.wait('@completeOnboarding');
    cy.location('pathname').should('eq', '/');
    cy.contains('Ljudeki koje možeš upoznati').should('be.visible');
    cy.contains('Još nema korisnika').should('be.visible');
  });
});
