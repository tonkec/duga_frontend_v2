/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
  publicId: 'user-current',
  username: 'cypress_user',
  onboarding_done: true,
  isVerified: true,
};

const alex = {
  id: 2,
  publicId: 'user-alex',
  username: 'alex_rain',
  onboarding_done: true,
  isVerified: true,
};

const richPhoto = {
  id: 990,
  createdAt: '2026-06-08T10:00:00.000Z',
  updatedAt: '2026-06-08T10:00:00.000Z',
  description:
    'Pozdrav @alex_rain https://youtu.be/dQw4w9WgXcQ https://media0.giphy.com/media/forum-original/giphy.gif /user/123e4567-e89b-12d3-a456-426614174000 https://example.com/not-allowed.png',
  fileType: 'image/png',
  isProfilePhoto: false,
  name: 'rich-photo.png',
  securePhotoUrl: '/uploads/files/development/user/1/rich-photo.png',
  url: '/uploads/files/development/user/1/rich-photo.png',
  userId: '1',
  taggedUsers: [alex],
};

const setupRichProfile = () => {
  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({
    uploads: [richPhoto],
    users: [currentUser, alex],
    forumQuestions: [],
  });

  cy.intercept('GET', /\/uploads\/photo\/990(?:\?.*)?$/, {
    statusCode: 200,
    body: richPhoto,
  }).as('getPhoto');

  cy.intercept('GET', /\/uploads\/files\/development\/user\/1\/rich-photo\.png(?:\?.*)?$/, {
    statusCode: 200,
    headers: { 'content-type': 'image/png' },
    body: Cypress.Buffer.from('fake png contents'),
  }).as('getRichPhotoBlob');

  cy.intercept('GET', /\/users\/1(?:\?.*)?$/, {
    statusCode: 200,
    body: currentUser,
  });

  cy.intercept('GET', /\/users\/2(?:\?.*)?$/, {
    statusCode: 200,
    body: alex,
  });

  cy.intercept('GET', /\/comments\/get-comments\/990(?:\?.*)?$/, {
    statusCode: 200,
    body: [],
  });

  cy.intercept('GET', /\/likes\/all-likes\/990(?:\?.*)?$/, {
    statusCode: 200,
    body: [
      { id: 1, userId: '2', user: alex },
      { id: 2, userId: '3', user: { id: 3, publicId: 'user-mira', username: 'mira_sun' } },
    ],
  }).as('getLikes');

  cy.intercept('POST', /\/likes\/upvote\/990(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('upvotePhoto');

  cy.intercept('POST', /\/likes\/downvote\/990(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('downvotePhoto');

  cy.intercept('POST', /\/uploads\/photos\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { images: [{ ...richPhoto, isProfilePhoto: true }] },
  }).as('setProfilePhoto');

  cy.intercept('GET', /\/uploads\/user\/1(?:\?.*)?$/, {
    statusCode: 200,
    body: { images: [richPhoto] },
  });

  cy.intercept('GET', /\/uploads\/user-photos\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: [richPhoto],
  });
};

describe('profile share and rich photo content', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('copies and opens the own profile share link', () => {
    setupRichProfile();

    cy.visitAsAuthenticated('/profile?tab=share');
    cy.contains('Podijeli profil').should('be.visible');
    cy.contains('/user/user-current').should('be.visible');
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves().as('writeClipboard');
    });
    cy.contains('button', 'Kopiraj').click();
    cy.get('@writeClipboard').should('have.been.calledWith', '/user/user-current');
    cy.contains('Kopirano').should('be.visible');
    cy.contains('a', 'Otvori interni link').click();
    cy.location('pathname').should('eq', '/user/user-current');
  });

  it('renders rich photo content and toggles photo likes', () => {
    setupRichProfile();

    cy.visitAsAuthenticated('/photo/990');
    cy.getByTestId('photo-page').should('be.visible');
    cy.wait('@getLikes');
    cy.contains('@alex_rain').should('be.visible').click();
    cy.location('pathname').should('eq', '/user/user-alex');

    cy.go('back');
    cy.getByTestId('photo-page').should('be.visible');
    cy.get('iframe[title="YouTube video"]').should('be.visible');
    cy.get('iframe[src*="giphy.com/embed/forum-original"]').should('be.visible');
    cy.contains('a', '/user/123e4567-e89b-12d3-a456-426614174000').should('be.visible');
    cy.contains('a', 'https://example.com/not-allowed.png').should('be.visible');

    cy.contains('button', '2 lajka').click();
    cy.contains('Sviđanja').should('exist');
    cy.contains('alex_rain').should('exist');
    cy.contains('mira_sun').should('exist');
    cy.contains('button', 'alex_rain').click({ force: true });
    cy.location('pathname').should('eq', '/user/user-alex');

    cy.go('back');
    cy.getByTestId('photo-page').should('be.visible');
    cy.get('[aria-label="Lajkaj fotografiju"]').click();
    cy.wait('@upvotePhoto');
    cy.contains('Fotografija je lajkana').should('be.visible');
    cy.get('[aria-label="Ukloni lajk"]').click();
    cy.wait('@downvotePhoto');
  });

  it('sets an owned photo as profile photo', () => {
    setupRichProfile();

    cy.visitAsAuthenticated('/photo/990');
    cy.getByTestId('photo-page').should('be.visible');
    cy.contains('button', 'Postavi kao profilnu').click();
    cy.wait('@setProfilePhoto').then((interception) => {
      expect(Boolean(interception.request.body)).to.equal(true);
    });
  });
});
