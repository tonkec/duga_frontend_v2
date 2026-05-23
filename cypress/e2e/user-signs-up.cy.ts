const currentUser = {
  id: 'user-cypress-signup',
  username: 'cypress_signup',
  onboarding_done: false,
};

describe('user signup', () => {
  it('creates an account and completes onboarding', () => {
    let onboardingDone = false;

    cy.intercept('POST', '**/register', {
      statusCode: 201,
      body: { data: currentUser },
    }).as('register');

    cy.intercept('POST', '**/sessions/start', {
      statusCode: 201,
      body: { data: { active: true } },
    }).as('startSession');

    cy.intercept('GET', '**/users/current-user/**', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          data: {
            ...currentUser,
            onboarding_done: onboardingDone,
          },
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
          data: {
            ...currentUser,
            onboarding_done: true,
          },
        },
      });
    }).as('completeOnboarding');

    cy.intercept('GET', '**/users/get-users/**', {
      statusCode: 200,
      body: { data: [] },
    }).as('getUsers');

    cy.intercept('GET', '**/uploads/latest', {
      statusCode: 200,
      body: { data: [] },
    }).as('getLatestUploads');

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
    cy.contains('Zadnji online korisnici').should('be.visible');
    cy.contains('Nema korisnika').should('be.visible');
  });
});
