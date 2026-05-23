/// <reference types="cypress" />

const currentUser = {
  id: 1,
  username: 'cypress_chatter',
  age: '30',
  onboarding_done: true,
  isVerified: true,
  status: 'online',
};

const existingRecipient = {
  id: 2,
  username: 'existing_chat_friend',
  isVerified: true,
  status: 'offline',
};

const newRecipient = {
  id: 3,
  username: 'new_chat_friend',
  isVerified: true,
  status: 'offline',
};

const existingChat = {
  id: 201,
  type: 'private',
  createdAt: '2026-05-23T07:01:00.000Z',
  Users: [existingRecipient],
  Messages: [
    {
      id: 5001,
      message: 'Existing hello',
      content: 'Existing hello',
      createdAt: '2026-05-23T07:01:00.000Z',
      User: existingRecipient,
      fromUserId: existingRecipient.id,
      chatId: 201,
      type: 'text',
      securePhotoUrl: '',
      messagePhotoUrl: '',
    },
  ],
  ChatUser: {
    userId: String(currentUser.id),
    chatId: 201,
    createdAt: '2026-05-23T07:01:00.000Z',
    updatedAt: '2026-05-23T07:01:00.000Z',
  },
};

const newChat = {
  id: 202,
  type: 'private',
  createdAt: '2026-05-23T07:02:00.000Z',
  Users: [newRecipient],
  Messages: [],
  ChatUser: {
    userId: String(currentUser.id),
    chatId: 202,
    createdAt: '2026-05-23T07:02:00.000Z',
    updatedAt: '2026-05-23T07:02:00.000Z',
  },
};

const setupChatMocks = () => {
  let hasCreatedChat = false;

  cy.clearLocalStorage();
  cy.clearCookies();

  cy.intercept('POST', '**/register', {
    statusCode: 201,
    body: currentUser,
  }).as('register');

  cy.intercept('POST', '**/sessions/start', {
    statusCode: 201,
    body: { active: true },
  }).as('startSession');

  cy.intercept('GET', '**/users/current-user/**', {
    statusCode: 200,
    body: currentUser,
  }).as('getCurrentUser');

  cy.intercept('GET', '**/users/get-users/**', {
    statusCode: 200,
    body: [existingRecipient, newRecipient],
  }).as('getUsers');

  cy.intercept('GET', '**/users/2', {
    statusCode: 200,
    body: existingRecipient,
  }).as('getExistingRecipient');

  cy.intercept('GET', '**/users/3', {
    statusCode: 200,
    body: newRecipient,
  }).as('getNewRecipient');

  cy.intercept('GET', '**/chats', (req) => {
    req.reply({
      statusCode: 200,
      body: hasCreatedChat ? [existingChat, newChat] : [existingChat],
    });
  }).as('getChats');

  cy.intercept('POST', '**/chats/create', (req) => {
    expect(req.body).to.deep.equal({ partnerId: newRecipient.id });
    hasCreatedChat = true;

    req.reply({
      statusCode: 201,
      body: [newChat],
    });
  }).as('createChat');

  cy.intercept('GET', '**/chats/current-chat/201*', {
    statusCode: 200,
    body: [{ userId: currentUser.id }, { userId: existingRecipient.id }],
  }).as('getExistingChat');

  cy.intercept('GET', '**/chats/current-chat/202*', {
    statusCode: 200,
    body: [{ userId: currentUser.id }, { userId: newRecipient.id }],
  }).as('getNewChat');

  cy.intercept('GET', '**/chats/messages/**', {
    statusCode: 200,
    body: {
      messages: [],
      pagination: {
        page: 1,
        totalPages: 1,
      },
    },
  }).as('getMessages');

  cy.intercept('GET', '**/messages/is-read/**', {
    statusCode: 200,
    body: { is_read: true },
  });

  cy.intercept('GET', '**/uploads/profile-photo/**', {
    statusCode: 404,
    body: {},
  });

  cy.intercept('GET', '**/uploads/user-photos/**', {
    statusCode: 200,
    body: [],
  });

  cy.intercept('GET', '**/notifications**', {
    statusCode: 200,
    body: [],
  });
};

const loginAndOpenMessages = () => {
  cy.setCookie('cookieAccepted', 'true');
  cy.visit('/login');
  cy.contains('button', 'Prijavi se').first().click();

  cy.wait('@register');
  cy.wait('@startSession');
  cy.visit('/new-chat');
};

describe('user creates and continues chat', () => {
  it('creates a new chat from the messages modal', () => {
    setupChatMocks();
    loginAndOpenMessages();

    cy.contains('h1', 'Poruke').should('be.visible');
    cy.contains(existingRecipient.username).should('be.visible');
    cy.contains('button', 'Nova poruka').click();
    cy.get('input[placeholder="Pretraži po korisničkom imenu..."]').type(newRecipient.username);
    cy.contains('button[role="option"]', newRecipient.username).click();

    cy.wait('@createChat');
    cy.location('pathname').should('eq', '/chat/202');
    cy.contains('h1', newRecipient.username).should('be.visible');
  });

  it('continues an existing chat from the messages list', () => {
    setupChatMocks();
    loginAndOpenMessages();

    cy.contains('h1', 'Poruke').should('be.visible');
    cy.contains('button', existingRecipient.username).click();

    cy.location('pathname').should('eq', '/chat/201');
    cy.contains('h1', existingRecipient.username).should('be.visible');
  });
});
