/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
  publicId: 'current-public',
  username: 'current_user',
  isVerified: true,
  onboarding_done: true,
};

const users = [
  currentUser,
  { id: 2, publicId: 'alex-public', username: 'alex', gender: 'Nebinarna osoba', isVerified: true, status: 'online' },
  { id: 3, publicId: 'bo-public', username: 'bo', sexuality: 'Queer', isVerified: true, status: 'offline' },
  { id: 4, username: 'no-public-id', location: 'Zagreb', isVerified: true, status: 'offline' },
  { id: 5, publicId: 'unverified-public', username: 'unverified', isVerified: false, status: 'online' },
];

const chats = [
  {
    id: 20,
    type: 'private',
    name: '',
    createdAt: '2026-06-08T09:00:00.000Z',
    ChatUser: { userId: '1', chatId: 20, createdAt: '', updatedAt: '' },
    Users: [users[1]],
    Messages: [
      {
        id: 200,
        chatId: 20,
        fromUserId: 2,
        type: 'text',
        message: 'Bok iz postojećeg razgovora',
        createdAt: '2026-06-08T10:00:00.000Z',
        User: users[1],
      },
    ],
  },
  {
    id: 21,
    type: 'group',
    name: 'Duga grupa',
    createdAt: '2026-06-08T08:00:00.000Z',
    ChatUser: { userId: '1', chatId: 21, createdAt: '', updatedAt: '' },
    Users: [users[1], users[2]],
    Messages: [
      {
        id: 201,
        chatId: 21,
        fromUserId: 3,
        type: 'text',
        message: 'Grupna poruka',
        createdAt: '2026-06-08T09:30:00.000Z',
        User: users[2],
      },
    ],
  },
];

const setupDirectoryAndChats = () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.mockAuthenticatedSession({ currentUser });

  cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: currentUser,
  }).as('getCurrentUser');
  cy.intercept('GET', /\/users\/get-users\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: { users } },
  }).as('getUsers');
  cy.intercept('GET', /\/chats(?:\?.*)?$/, {
    statusCode: 200,
    body: chats,
  }).as('getChats');
  cy.intercept('GET', /\/messages\/is-read\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { is_read: false },
  }).as('isMessageRead');
  cy.intercept('POST', /\/messages\/read-message\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('markRead');
  cy.intercept('POST', /\/chats\/create(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: {
        id: 99,
        type: req.body.name ? 'group' : 'private',
        name: req.body.name ?? '',
        Users: [currentUser, users[2], users[3]],
        Messages: [],
      },
    });
  }).as('createChat');
  cy.intercept('GET', /\/uploads\/user\/[^/?]+(?:\?.*)?$/, (req) => {
    const userId = Number(req.url.match(/\/uploads\/user\/([^/?]+)/)?.[1]);
    req.reply({
      statusCode: 200,
      body: {
        images:
          userId === 2
            ? [{ id: 1, isProfilePhoto: true, securePhotoUrl: 'development/user/alex.png' }]
            : [],
      },
    });
  }).as('getUserImages');
  cy.intercept('GET', /\/uploads\/profile-photo\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: {},
  });
  cy.intercept('GET', /\/uploads\/files\/.*(?:\?.*)?$/, {
    statusCode: 200,
    headers: { 'content-type': 'image/png' },
    body: Cypress.Buffer.from('fake png contents'),
  });
};

describe('users and new chat branch coverage', () => {
  it('covers new-message modal private, group, and empty search branches', () => {
    setupDirectoryAndChats();

    cy.visitAsAuthenticated('/new-chat');
    cy.contains('h1', 'Poruke').should('be.visible');
    cy.contains('Duga grupa').should('be.visible');
    cy.contains('2 aktivna razgovora').should('be.visible');

    cy.getByTestId('new-message-button').click();
    cy.getByTestId('new-message-modal').should('be.visible');
    cy.getByTestId('new-message-modal').within(() => {
      cy.getByTestId('new-message-search').type('nema');
      cy.contains('Nema korisnika za taj upit').should('be.visible');
      cy.getByTestId('new-message-search').clear().type('alex');
      cy.contains('button', 'alex').click();
    });
    cy.location('pathname').should('eq', '/chat/20');

    cy.visitAsAuthenticated('/new-chat');
    cy.getByTestId('new-message-button').click();
    cy.getByTestId('new-message-modal').within(() => {
      cy.contains('button', 'Grupa').click();
      cy.contains('button', 'Kreiraj grupu').should('be.disabled');
      cy.get('input[placeholder="Naziv grupe"]').type('Nova Cypress grupa');
      cy.contains('button', 'bo').click();
      cy.contains('button', 'no-public-id').click();
      cy.contains('button', 'Kreiraj grupu').click();
    });
    cy.wait('@createChat').its('request.body').should('deep.equal', {
      userIds: [3, 4],
      name: 'Nova Cypress grupa',
    });
  });

  it('covers user directory filters, profile-photo filter, and clear state', () => {
    setupDirectoryAndChats();

    cy.visitAsAuthenticated('/users');
    cy.getByTestId('users-page').should('be.visible');
    cy.contains('alex').should('be.visible');
    cy.contains('button', 'Rod').click();
    cy.getByTestId('users-search-input').type('Nebinarna');
    cy.contains('alex').should('be.visible');
    cy.contains('button', 'Očisti').click();
    cy.getByTestId('users-profile-photo-filter').check();
    cy.contains('alex').should('be.visible');
    cy.contains('bo').should('not.exist');
    cy.getByTestId('users-search-input').type('nobody');
    cy.getByTestId('users-empty-state').should('contain.text', 'Nema korisnika za ovaj upit');
    cy.getByTestId('users-clear-search').click();
    cy.contains('alex').should('be.visible');
  });
});
