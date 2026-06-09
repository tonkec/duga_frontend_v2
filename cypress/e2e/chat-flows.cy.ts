/// <reference types="cypress" />

export {};

describe('chat flows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('creates a one-to-one chat from the empty messages state', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('users').then((users) => {
        cy.fixture('profiles').then((profiles) => {
          cy.fixture('chats').then((chats) => {
            let chatCreated = false;

            cy.mockAuthenticatedSession({ currentUser });
            cy.mockDefaultApi({ users, chats: [] });

            cy.intercept('GET', '**/users/3', {
              statusCode: 200,
              body: profiles.mira,
            }).as('getMiraById');

            cy.intercept('GET', '**/chats', (req) => {
              req.reply({
                statusCode: 200,
                body: chatCreated ? [chats.created] : [],
              });
            }).as('getChats');

            cy.intercept('POST', '**/chats/create', (req) => {
              expect(req.body).to.deep.equal({ partnerPublicId: 'user-mira' });
              chatCreated = true;
              req.reply({
                statusCode: 201,
                body: [chats.created],
              });
            }).as('createChat');

            cy.intercept('GET', /\/chats\/messages\/?(?:\?.*)?$/, {
              statusCode: 200,
              body: { messages: [], pagination: { page: 1, totalPages: 1 } },
            }).as('getMessages');

            cy.visitAsAuthenticated('/new-chat');

            cy.wait('@getChats');
            cy.getByTestId('messages-page', { timeout: 10000 }).should('be.visible');
            cy.getByTestId('messages-empty-state', { timeout: 10000 }).should(
              'contain',
              'Nema razgovora'
            );
            cy.getByTestId('new-message-button').click();
            cy.getByTestId('new-message-modal').should('be.visible');
            cy.getByTestId('new-message-search').type('mira');
            cy.getByTestId('new-message-user-option').contains('mira_sun').click();

            cy.wait('@createChat');
            cy.location('pathname').should('eq', '/chat/202');
            cy.getByTestId('chat-page').should('be.visible');
          });
        });
      });
    });
  });

  it('renders an existing chat and sends a new text message through the socket', () => {
    const newMessage = 'Nova poruka iz Cypress testa.';

    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('users').then((users) => {
        cy.fixture('profiles').then((profiles) => {
          cy.fixture('chats').then((chats) => {
            cy.fixture('messages').then((messages) => {
              cy.mockAuthenticatedSession({ currentUser });
              cy.mockDefaultApi({ users, chats: chats.existing });

              cy.intercept('GET', '**/users/2', {
                statusCode: 200,
                body: profiles.alex,
              }).as('getAlexById');

              cy.intercept('GET', /\/chats\/messages\/?(?:\?.*)?$/, {
                statusCode: 200,
                body: messages.existingChat,
              }).as('getMessages');

              cy.visitAsAuthenticated('/chat/201');

              cy.getByTestId('chat-page').should('be.visible');
              cy.wait('@getMessages')
                .its('response.body.messages')
                .should('have.length', 2);
              cy.getByTestId('chat-header').should('contain', 'alex_rain');
              cy.contains('Bok iz postojećeg razgovora.').should('be.visible');
              cy.contains('Drago mi je da test radi.').should('be.visible');

              cy.getByTestId('chat-message-input').type(newMessage);
              cy.assertSocketEvent('typing', { chatId: '201' });
              cy.getByTestId('chat-message-submit').click();

              cy.assertSocketEvent('message', {
                type: 'text',
                chatId: '201',
                message: newMessage,
              });
              cy.assertSocketEvent('stop-typing', { chatId: '201' });
              cy.contains(newMessage).should('be.visible');
            });
          });
        });
      });
    });
  });
});
