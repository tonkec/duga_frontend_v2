/// <reference types="cypress" />

export {};

type BackendUser = {
  id: number;
  publicId: string;
  username: string;
  onboarding_done: boolean;
  isVerified: boolean;
  status?: string;
};

type SocketEvent = {
  event: string;
  payload?: Record<string, unknown>;
};

const currentUser: BackendUser = {
  id: 1,
  publicId: 'user-current',
  username: 'cypress_user',
  onboarding_done: true,
  isVerified: true,
  status: 'online',
};

const alex: BackendUser = {
  id: 2,
  publicId: 'user-alex',
  username: 'alex_rain',
  onboarding_done: true,
  isVerified: true,
  status: 'offline',
};

const mira: BackendUser = {
  id: 3,
  publicId: 'user-mira',
  username: 'mira_sun',
  onboarding_done: true,
  isVerified: true,
  status: 'online',
};

const groupChat = {
  id: 301,
  type: 'group',
  name: 'Cypress grupa',
  createdAt: '2026-06-07T09:00:00.000Z',
  Users: [
    { ...currentUser, role: 'admin', ChatUser: { role: 'admin' } },
    { ...alex, role: 'member', ChatUser: { role: 'member' } },
  ],
  ChatUser: {
    userId: '1',
    chatId: 301,
    role: 'admin',
  },
};

const groupMessages = {
  messages: [
    {
      id: 6101,
      message: 'Poruka za pretragu u grupi',
      content: 'Poruka za pretragu u grupi',
      createdAt: '2026-06-07T09:01:00.000Z',
      User: {
        id: 2,
        publicId: 'user-alex',
        username: 'alex_rain',
      },
      fromUserId: 2,
      chatId: 301,
      type: 'text',
      securePhotoUrl: '',
      messagePhotoUrl: '',
      reactions: [
        {
          emoji: '❤️',
          count: 1,
          userIds: [2],
        },
      ],
      userReactions: [],
    },
    {
      id: 6102,
      message: 'Druga grupna poruka',
      content: 'Druga grupna poruka',
      createdAt: '2026-06-07T09:02:00.000Z',
      User: {
        id: 1,
        publicId: 'user-current',
        username: 'cypress_user',
      },
      fromUserId: 1,
      chatId: 301,
      type: 'text',
      securePhotoUrl: '',
      messagePhotoUrl: '',
      reactions: [
        {
          emoji: '👍',
          count: 2,
          userIds: [1, 2],
        },
      ],
      userReactions: ['👍'],
    },
  ],
  pagination: {
    page: 1,
    totalPages: 1,
  },
};

const gifResponse = {
  data: [
    {
      id: 'cypress-gif',
      title: 'Cypress dancing gif',
      images: {
        fixed_height: {
          url: 'https://media0.giphy.com/media/cypress-preview/giphy.gif',
        },
        original: {
          url: 'https://media0.giphy.com/media/cypress-original/giphy.gif',
        },
      },
    },
  ],
};

const setupGroupChat = ({
  chats = [groupChat],
  users = [currentUser, alex, mira],
  messages = groupMessages,
}: {
  chats?: unknown[];
  users?: BackendUser[];
  messages?: Record<string, unknown>;
} = {}) => {
  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ chats, users, uploads: [] });

  cy.intercept('GET', '**/users/2**', {
    statusCode: 200,
    body: alex,
  }).as('getAlex');

  cy.intercept('GET', '**/users/3**', {
    statusCode: 200,
    body: mira,
  }).as('getMira');

  cy.intercept('GET', /\/chats\/messages\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: messages,
  }).as('getMessages');

  cy.intercept('POST', /\/chats\/301\/leave\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { chatId: 301, userId: 1, notifyUsers: [2], newAdminUserId: 2 },
  }).as('leaveChat');

  cy.intercept('DELETE', /\/chats\/301\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('deleteChat');

  cy.intercept('GET', 'https://api.giphy.com/v1/gifs/**', {
    statusCode: 200,
    body: gifResponse,
  }).as('getGifs');
};

const openGroupChat = () => {
  cy.visitAsAuthenticated('/chat/301');
  cy.getByTestId('chat-page').should('be.visible');
  cy.wait('@getMessages');
};

const assertSocketEvent = (
  predicate: (event: SocketEvent) => boolean,
  label: string
) => {
  cy.window()
    .its('__dugaCypressSocketEvents')
    .should((events: SocketEvent[] | undefined) => {
      expect(Boolean(events?.some(predicate)), label).to.equal(true);
    });
};

describe('chat group and reaction branches', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('adds members, searches messages, handles socket states, and uses group modals', () => {
    setupGroupChat();
    openGroupChat();

    cy.getByTestId('chat-header').should('contain', 'Cypress grupa');
    cy.contains('2 članova').should('be.visible');

    cy.contains('button', 'Dodaj osobe').click();
    cy.contains('Dodaj osobe').should('be.visible');
    cy.get('input[placeholder="Pretraži po korisničkom imenu..."]').type('nema');
    cy.contains('Nema korisnika za taj upit').should('be.visible');
    cy.get('input[placeholder="Pretraži po korisničkom imenu..."]').clear().type('mira');
    cy.contains('button[role="option"]', 'mira_sun').click();
    cy.contains('Odabrano').should('be.visible');
    cy.contains('button[role="option"]', 'mira_sun').click();
    cy.contains('Odabrano').should('not.exist');
    cy.contains('button[role="option"]', 'mira_sun').click();
    cy.contains('button', 'Dodaj odabrane').click();
    assertSocketEvent(
      (event) =>
        event.event === 'add-user-to-group' &&
        event.payload?.chatId === 301 &&
        event.payload?.userId === 3,
      'add member socket'
    );

    cy.getByTestId('chat-message-search').type('pretragu');
    cy.getByTestId('chat-messages-list').should('contain', 'Poruka za pretragu u grupi');
    cy.getByTestId('chat-messages-list').should('not.contain', 'Druga grupna poruka');
    cy.getByTestId('chat-message-search').clear().type('bez rezultata');
    cy.getByTestId('chat-messages-no-results').should('be.visible');
    cy.getByTestId('chat-message-search').clear();

    cy.receiveSocketEvent('typing', { chatId: 301, userId: 2 });
    cy.get('[role="status"][aria-label="Druga osoba piše"]').should('be.visible');
    cy.receiveSocketEvent('stop-typing', { chatId: 301, userId: 2 });
    cy.get('[role="status"][aria-label="Druga osoba piše"]').should('not.exist');
    cy.receiveSocketEvent('status-update', { userId: 2, status: 'online' });
    cy.receiveSocketEvent('message_error', {
      chatId: 301,
      message: 'Mentions must be chat members',
    });
    cy.contains('Mention možeš poslati samo osobi koja je član ovog razgovora.').should(
      'be.visible'
    );
    cy.receiveSocketEvent('message_rejected', { chatId: 301 });
    cy.contains('Poruka je odbijena.').should('be.visible');

    cy.contains('button', 'Izađi').click();
    cy.contains('Želiš li izaći iz ovog grupnog razgovora?').should('be.visible');
    cy.contains('button', 'Natrag').click();
    cy.contains('button', 'Izbriši').click();
    cy.contains('Jesi li siguran_na da želiš obrisati razgovor?').should('be.visible');
    cy.contains('button', 'Natrag').click();
  });

  it('covers reaction add/remove and Giphy message sending', () => {
    setupGroupChat();
    openGroupChat();

    cy.get('[aria-label="Dodaj reakciju"]').first().click();
    cy.get('[aria-label="Odaberi emoji 🎉"]').click();
    assertSocketEvent(
      (event) =>
        event.event === 'react-message' &&
        event.payload?.messageId === 6101 &&
        event.payload?.emoji === '🎉',
      'react message socket'
    );

    cy.get('[aria-label="Makni reakciju 👍"]').click();
    assertSocketEvent(
      (event) =>
        event.event === 'remove-message-reaction' &&
        event.payload?.messageId === 6102 &&
        event.payload?.emoji === '👍',
      'remove reaction socket'
    );

    cy.receiveSocketEvent('message-reaction-updated', {
      chatId: 301,
      messageId: 6101,
      emoji: '🔥',
      count: 1,
      reactedByCurrentUser: true,
    });
    cy.get('[aria-label="Makni reakciju 🔥"]').should('be.visible');
    cy.receiveSocketEvent('message_reaction_error', { chatId: 301 });
    cy.contains('Reakciju nije moguće spremiti. Probaj opet.').should('be.visible');

    cy.getByTestId('chat-open-gif').click();
    cy.wait('@getGifs');
    cy.contains('Stranica 1').should('be.visible');
    cy.get('img[alt="Cypress dancing gif"]').parent('button').click();
    assertSocketEvent(
      (event) =>
        event.event === 'message' &&
        event.payload?.type === 'gif' &&
        event.payload?.messagePhotoUrl ===
          'https://media0.giphy.com/media/cypress-original/giphy.gif',
      'gif message socket'
    );
  });

  it('shows the add-member limit branch', () => {
    const fullGroupUsers = Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      publicId: `user-${index + 1}`,
      username: index === 0 ? currentUser.username : `member_${index + 1}`,
      onboarding_done: true,
      isVerified: true,
      status: 'online',
      role: index === 0 ? 'admin' : 'member',
      ChatUser: { role: index === 0 ? 'admin' : 'member' },
    }));
    const fullGroupChat = {
      ...groupChat,
      id: 302,
      name: 'Puna Cypress grupa',
      Users: fullGroupUsers,
      ChatUser: { userId: '1', chatId: 302, role: 'admin' },
    };

    setupGroupChat({
      chats: [fullGroupChat],
      users: fullGroupUsers,
      messages: { messages: [], pagination: { page: 1, totalPages: 1 } },
    });

    cy.visitAsAuthenticated('/chat/302');
    cy.getByTestId('chat-page').should('be.visible');
    cy.contains('50 članova').should('be.visible');
    cy.contains('button', 'Dodaj osobe').click();
    cy.contains('Ovaj grupni chat već ima maksimalnih 50 članova.').should('be.visible');
    cy.contains('button', 'Odustani').click();
  });
});
