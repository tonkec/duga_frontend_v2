/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
  publicId: 'user-cypress-sender',
  username: 'cypress_sender',
  age: '30',
  onboarding_done: true,
  isVerified: true,
  status: 'online',
};

const recipient = {
  id: 2,
  publicId: 'user-cypress-recipient',
  username: 'cypress_recipient',
  age: 31,
  onboarding_done: true,
  isVerified: true,
  status: 'offline',
  bio: 'Open to a first Cypress message.',
  location: 'Zagreb',
  sexuality: 'Queer',
  gender: 'Nebinarna osoba',
  lookingFor: 'friendship',
  relationshipStatus: 'single',
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
};

const chat = {
  id: 101,
  type: 'private',
  name: recipient.username,
  createdAt: '2026-05-23T06:57:00.000Z',
  Users: [recipient, currentUser],
  Messages: [],
  ChatUser: {
    userId: String(currentUser.id),
    chatId: 101,
    createdAt: '2026-05-23T06:57:00.000Z',
    updatedAt: '2026-05-23T06:57:00.000Z',
  },
};

describe('user sends first message', () => {
  it('creates a chat and sends the first text message', () => {
    let hasCreatedChat = false;
    const firstMessage = 'Hey from Cypress, this is our first message.';

    cy.clearLocalStorage();
    cy.clearCookies();

    cy.mockAuthenticatedSession({ currentUser });

    cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: currentUser,
    }).as('getCurrentUser');

    cy.intercept('GET', '**/users/user-cypress-recipient', {
      statusCode: 200,
      body: recipient,
    }).as('getRecipient');

    cy.intercept('GET', '**/chats', (req) => {
      req.reply({
        statusCode: 200,
        body: hasCreatedChat ? [chat] : [],
      });
    }).as('getChats');

    cy.intercept('POST', '**/chats/create', (req) => {
      expect(req.body).to.deep.equal({ partnerPublicId: recipient.publicId });
      hasCreatedChat = true;

      req.reply({
        statusCode: 201,
        body: [chat],
      });
    }).as('createChat');

    cy.intercept('GET', '**/chats/current-chat/101*', {
      statusCode: 200,
      body: [{ userId: currentUser.id }, { userId: recipient.id }],
    }).as('getCurrentChat');

    cy.intercept('GET', /\/chats\/messages\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        messages: [],
        pagination: {
          page: 1,
          totalPages: 1,
        },
      },
    }).as('getMessages');

    cy.intercept('GET', /\/uploads\/profile-photo\/[^/?]+(?:\?.*)?$/, {
      statusCode: 404,
      body: {},
    });

    cy.intercept('GET', /\/uploads\/user\/[^/?]+(?:\?.*)?$/, {
      statusCode: 200,
      body: { images: [] },
    });

    cy.intercept('GET', /\/uploads\/user-photos\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', /\/notifications\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [],
    });

    cy.visitAsAuthenticated('/user/user-cypress-recipient');

    cy.contains('h1', recipient.username).should('be.visible');
    cy.contains('button', 'Započni razgovor').click();

    cy.wait('@createChat');
    cy.location('pathname').should('eq', '/chat/101');
    cy.contains('h1', recipient.username).should('be.visible');
    cy.contains('Nema poruka u ovom razgovoru').should('be.visible');

    cy.get('input[placeholder^="Napiši poruku"]').type(firstMessage);
    cy.get('form').find('button[type="submit"]').click();

    cy.window()
      .its('__dugaCypressSocketEvents')
      .should((events: Array<{ event: string; payload: Record<string, unknown> }>) => {
        const messageEvent = events.find((event) => event.event === 'message');

        expect(messageEvent?.payload).to.deep.include({
          type: 'text',
          chatId: String(chat.id),
          message: firstMessage,
        });
      });

    cy.contains(firstMessage).should('be.visible');
  });
});
