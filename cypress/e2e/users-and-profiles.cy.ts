/// <reference types="cypress" />

export {};

type RouteRequest = {
  body: unknown;
  reply: (response: unknown) => void;
};

const setupUsersAndProfiles = (
  chats: unknown[] = [],
  onCreateChat?: (req: RouteRequest) => void
) => {
  cy.fixture('current-user').then((currentUser) => {
    cy.fixture('users').then((users) => {
      cy.fixture('profiles').then((profiles) => {
        cy.mockAuthenticatedSession({ currentUser });
        cy.mockDefaultApi({ users, chats });

        cy.intercept('GET', '**/users/user-alex', {
          statusCode: 200,
          body: profiles.alex,
        }).as('getAlexProfile');

        cy.intercept('GET', '**/users/2', {
          statusCode: 200,
          body: profiles.alex,
        }).as('getAlexById');

        cy.intercept('GET', '**/users/user-mira', {
          statusCode: 200,
          body: profiles.mira,
        }).as('getMiraProfile');

        cy.intercept('GET', '**/users/3', {
          statusCode: 200,
          body: profiles.mira,
        }).as('getMiraById');

        if (onCreateChat) {
          cy.intercept('POST', '**/chats/create', onCreateChat).as('createChat');
        } else {
          cy.intercept('POST', '**/chats/create').as('createChat');
        }
      });
    });
  });
};

describe('users and profiles', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('filters users and navigates from the directory to a profile', () => {
    setupUsersAndProfiles();

    cy.visitAsAuthenticated('/users');

    cy.getByTestId('user-card').should('have.length', 2);
    cy.contains('alex_rain').should('be.visible');
    cy.contains('mira_sun').should('be.visible');
    cy.contains('hidden_unverified').should('not.exist');

    cy.getByTestId('users-search-input').type('nobody');
    cy.getByTestId('users-empty-state').should('contain', 'Nema korisnika za ovaj upit');
    cy.getByTestId('users-clear-search').click();

    cy.getByTestId('users-search-input').type('alex');
    cy.getByTestId('user-card').should('have.length', 1);
    cy.getByTestId('user-card-open-profile').click();

    cy.location('pathname').should('eq', '/user/user-alex');
    cy.getByTestId('other-profile-page').should('be.visible');
    cy.contains('h1', 'alex_rain').should('be.visible');
  });

  it('creates a new chat from a profile without an existing conversation', () => {
    let chatCreated = false;

    cy.fixture('chats').then((chats) => {
      setupUsersAndProfiles([], (req) => {
        expect(req.body).to.deep.equal({ partnerPublicId: 'user-mira' });
        chatCreated = true;
        req.reply({
          statusCode: 201,
          body: [chats.created],
        });
      });

      cy.intercept('GET', '**/chats', (req) => {
        req.reply({
          statusCode: 200,
          body: chatCreated ? [chats.created] : [],
        });
      }).as('getChats');

      cy.intercept('GET', '**/chats/messages**', {
        statusCode: 200,
        body: { messages: [], pagination: { page: 1, totalPages: 1 } },
      }).as('getMessages');

      cy.visitAsAuthenticated('/user/user-mira');

      cy.getByTestId('profile-send-message-button')
        .should('be.visible')
        .and('contain', 'Započni razgovor')
        .click();

      cy.wait('@createChat');
      cy.location('pathname').should('eq', '/chat/202');
      cy.getByTestId('chat-page').should('be.visible');
    });
  });

  it('continues an existing chat from a profile without creating a duplicate', () => {
    cy.fixture('chats').then((chats) => {
      setupUsersAndProfiles(chats.existing);

      cy.intercept('GET', '**/chats/messages**', {
        statusCode: 200,
        body: { messages: [], pagination: { page: 1, totalPages: 1 } },
      }).as('getMessages');

      cy.visitAsAuthenticated('/user/user-alex');

      cy.getByTestId('profile-send-message-button')
        .should('be.visible')
        .and('contain', 'Nastavi razgovor')
        .click();

      cy.location('pathname').should('eq', '/chat/201');
      cy.get('@createChat.all').should('have.length', 0);
    });
  });
});
