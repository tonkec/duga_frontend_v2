/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
  publicId: 'user-cypress-edit-profile',
  username: 'cypress_editor',
  age: '29',
  onboarding_done: true,
  bio: 'Original bio',
  location: 'Zagreb',
  sexuality: '',
  gender: '',
  lookingFor: '',
  relationshipStatus: '',
  cigarettes: false,
  alcohol: false,
  sport: false,
  favoriteDayOfWeek: '',
  spirituality: '',
  embarasement: '',
  tooOldFor: '',
  makesMyDay: '',
  favoriteSong: '',
  favoriteMovie: '',
  interests: '',
  languages: '',
  ending: '',
  status: 'offline',
};

describe('user edits profile', () => {
  it('updates profile details', () => {
    let profileUser = { ...currentUser };

    cy.clearLocalStorage();
    cy.clearCookies();

    cy.mockAuthenticatedSession({ currentUser: profileUser });

    cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, (req) => {
      req.reply({
        statusCode: 200,
        body: profileUser,
      });
    }).as('getCurrentUser');

    cy.intercept('POST', '**/users/update-user', (req) => {
      expect(req.body.data).to.include({
        bio: 'Updated Cypress bio',
        gender: 'Nebinarna osoba',
        sexuality: 'Queer',
        interests: 'testing, music',
        languages: 'hrvatski, english',
        makesMyDay: 'Clean test runs and good coffee.',
      });

      profileUser = {
        ...profileUser,
        ...req.body.data,
      };

      req.reply({
        statusCode: 200,
        body: profileUser,
      });
    }).as('updateUser');

    cy.intercept('GET', /\/uploads\/profile-photo\/[^/?]+(?:\?.*)?$/, {
      statusCode: 404,
      body: {},
    }).as('getProfilePhoto');

    cy.intercept('GET', /\/uploads\/user\/[^/?]+(?:\?.*)?$/, {
      statusCode: 200,
      body: { images: [] },
    }).as('getUserPhotos');

    cy.visitAsAuthenticated('/edit');

    cy.contains('h1', 'Uredi profil').should('be.visible');
    cy.get('input[name="bio"]').clear().type('Updated Cypress bio');
    cy.get('input[name="gender"]').clear().type('Nebinarna osoba');
    cy.get('input[name="sexuality"]').clear().type('Queer');
    cy.get('textarea[name="makesMyDay"]').clear().type('Clean test runs and good coffee.');
    cy.get('input[name="interests"]').clear().type('testing, music');
    cy.get('input[name="languages"]').clear().type('hrvatski, english');
    cy.contains('button', 'Spremi').click();

    cy.wait('@updateUser');
    cy.location('pathname').should('eq', '/profile');
    cy.contains('Updated Cypress bio').should('be.visible');
    cy.contains('Nebinarna osoba').should('be.visible');
    cy.contains('Queer').should('be.visible');
    cy.contains('testing, music').should('be.visible');
  });
});
