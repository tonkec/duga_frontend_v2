/// <reference types="cypress" />

export {};

type NotificationFixture = {
  id: number;
  userId: number;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  chatId?: number | null;
  actionId: number | null;
  actionType: 'upload' | 'comment' | 'message' | 'forum_question' | 'forum_answer' | null;
  questionId?: number | null;
  answerId?: number | null;
};

const makeNotification = (
  overrides: Partial<NotificationFixture> = {}
): NotificationFixture => ({
  id: 501,
  userId: 1,
  type: 'activity',
  content: 'Mira ti je poslala novu poruku.',
  isRead: false,
  createdAt: '2026-06-07T08:00:00.000Z',
  updatedAt: '2026-06-07T08:00:00.000Z',
  chatId: null,
  actionId: null,
  actionType: null,
  ...overrides,
});

const isDocumentNavigation = (req: { headers: Record<string, string | string[] | undefined> }) => {
  const acceptHeader = req.headers.accept;
  const accept = Array.isArray(acceptHeader) ? acceptHeader.join(',') : acceptHeader ?? '';
  return accept.includes('text/html');
};

describe('notifications page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('shows an empty notification state', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi({ notifications: [] });

      cy.visitAsAuthenticated('/notifications');

      cy.contains('h1', 'Najnovije aktivnosti').should('be.visible');
      cy.contains('Nema obavijesti').should('be.visible');
      cy.contains('Nove poruke i aktivnosti prikazat će se ovdje.').should('be.visible');
      cy.contains('button', 'Označi sve kao pročitano').should('be.disabled');
    });
  });

  it('marks all notifications as read', () => {
    cy.fixture('current-user').then((currentUser) => {
      let notifications = [
        makeNotification(),
        makeNotification({
          id: 502,
          content: 'Netko je dao glas tvom pitanju.',
          actionType: 'forum_question',
          actionId: 101,
        }),
      ];

      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi();
      cy.intercept('GET', /\/notifications\/?(?:\?.*)?$/, (req) => {
        if (isDocumentNavigation(req)) {
          req.continue();
          return;
        }

        req.reply({
          statusCode: 200,
          body: notifications,
        });
      }).as('getNotifications');
      cy.intercept('PUT', /\/notifications\/mark-all-read\/?(?:\?.*)?$/, (req) => {
        notifications = notifications.map((notification) => ({ ...notification, isRead: true }));
        req.reply({
          statusCode: 200,
          body: { ok: true },
        });
      }).as('markAllNotificationsRead');

      cy.visitAsAuthenticated('/notifications');

      cy.contains('Mira ti je poslala novu poruku.').should('be.visible');
      cy.contains('Netko je dao glas tvom pitanju.').should('be.visible');
      cy.contains('Novo').should('be.visible');

      cy.contains('button', 'Označi sve kao pročitano').click();

      cy.wait('@markAllNotificationsRead');
      cy.contains('Novo').should('not.exist');
      cy.contains('Pročitano').should('be.visible');
      cy.contains('button', 'Označi sve kao pročitano').should('be.disabled');
    });
  });

  it('updates notifications from socket events', () => {
    cy.fixture('current-user').then((currentUser) => {
      const initialNotification = makeNotification({
        id: 503,
        content: 'Početna obavijest.',
      });
      const socketNotification = makeNotification({
        id: 504,
        content: 'Nova socket obavijest.',
        createdAt: '2026-06-07T08:05:00.000Z',
      });

      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi({ notifications: [initialNotification] });
      cy.intercept('PUT', /\/notifications\/503\/read\/?(?:\?.*)?$/, {
        statusCode: 200,
        body: { ok: true },
      }).as('markNotificationRead');

      cy.visitAsAuthenticated('/notifications');

      cy.contains('Početna obavijest.').should('be.visible');
      cy.receiveSocketEvent('new_notification', socketNotification);
      cy.contains('Nova socket obavijest.').should('be.visible');

      cy.receiveSocketEvent('markAsRead', { id: 504 });
      cy.contains('Nova socket obavijest.')
        .closest('button')
        .within(() => {
          cy.contains('Pročitano').should('be.visible');
        });

      cy.contains('Početna obavijest.').click();
      cy.wait('@markNotificationRead');
      cy.contains('Početna obavijest.')
        .closest('button')
        .within(() => {
          cy.contains('Pročitano').should('be.visible');
        });
    });
  });
});
