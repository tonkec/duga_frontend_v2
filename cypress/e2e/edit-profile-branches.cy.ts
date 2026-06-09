/// <reference types="cypress" />

export {};

const profileUser = {
  id: 1,
  publicId: 'user-cypress-edit-profile',
  username: 'cypress_editor',
  age: 29,
  onboarding_done: true,
  bio: 'Original bio',
  location: 'Zagreb',
  sexuality: 'Queer',
  gender: 'Nebinarna osoba',
  lookingFor: 'friendship',
  relationshipStatus: 'single',
  cigarettes: false,
  alcohol: true,
  sport: false,
  favoriteDayOfWeek: 'friday',
  spirituality: '',
  embarasement: '',
  tooOldFor: '',
  makesMyDay: '',
  favoriteSong: '',
  favoriteMovie: 'https://www.imdb.com/title/tt0111161/',
  interests: '',
  languages: '',
  ending: '',
  status: 'offline',
};

const setupEditProfile = () => {
  let currentUser = { ...profileUser };

  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ uploads: [], forumQuestions: [] });

  cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: currentUser,
    });
  }).as('getCurrentUser');

  cy.intercept('POST', '**/users/update-user', (req) => {
    currentUser = {
      ...currentUser,
      ...req.body.data,
    };
    req.reply({
      statusCode: 200,
      body: currentUser,
    });
  }).as('updateUser');

  cy.intercept('GET', /\/uploads\/profile-photo\/[^/?]+(?:\?.*)?$/, {
    statusCode: 404,
    body: {},
  });

  cy.intercept('GET', /\/uploads\/user\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { images: [] },
  });

  cy.intercept('GET', /https:\/\/v3\.sg\.media-imdb\.com\/suggestion\/.*\.json(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      d: [
        {
          id: 'tt0133093',
          l: 'The Matrix',
          y: 1999,
          i: {
            imageUrl: 'https://m.media-amazon.com/images/M/matrix.jpg',
          },
        },
      ],
    },
  }).as('searchImdb');
};

describe('edit profile branch coverage', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('updates lifestyle fields, emoji text, and IMDb selection branches', () => {
    setupEditProfile();

    cy.visitAsAuthenticated('/edit?tab=99');
    cy.contains('h1', 'Uredi profil').should('be.visible');
    cy.location('search').should('eq', '?tab=99');

    cy.get('input[name="gender"]').clear().type('Nebinarna osoba :)');
    cy.contains('button', '😊').click({ force: true });
    cy.get('input[name="gender"]').should('contain.value', '😊');

    cy.get('input[name="cigarettes"]').check({ force: true });
    cy.get('input[name="alcohol"]').uncheck({ force: true });
    cy.get('input[name="sport"]').check({ force: true });

    cy.get('textarea[name="embarasement"]').type('Pao_la sam pred cijelim Cypressom.');
    cy.get('textarea[name="tooOldFor"]').type('Premalo sna i previše flaky testova.');
    cy.get('textarea[name="makesMyDay"]').type('Stabilan coverage run i dobra kava.');
    cy.get('textarea[name="spirituality"]').type('Mir, priroda i ritam testova.');
    cy.get('textarea[name="ending"]').type('Još nešto o meni za kraj.');

    cy.get('input[placeholder="Pretraži IMDb film..."]').type('matrix');
    cy.wait('@searchImdb');
    cy.contains('button', 'The Matrix').click();
    cy.contains('Odabrani IMDb film:').should('be.visible');
    cy.contains('button', 'Ukloni').click();
    cy.contains('Odabrani IMDb film:').should('not.exist');
    cy.get('input[placeholder="Pretraži IMDb film..."]').type('matrix');
    cy.wait('@searchImdb');
    cy.contains('button', 'The Matrix').click();

    cy.contains('button', 'Spremi').click();
    cy.wait('@updateUser').then((interception) => {
      expect(interception.request.body.data).to.include({
        cigarettes: true,
        alcohol: false,
        sport: true,
        favoriteMovie: 'https://www.imdb.com/title/tt0133093/',
      });
      expect(interception.request.body.data.gender).to.include('😊');
    });
  });

  it('opens the profile photo tab from the edit page', () => {
    setupEditProfile();

    cy.visitAsAuthenticated('/edit?tab=1');
    cy.location('search').should('eq', '?tab=1');
    cy.getByTestId('profile-photo-upload-form').should('be.visible');
  });
});
