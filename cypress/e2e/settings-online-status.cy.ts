/// <reference types="cypress" />

export {};

type SocketEvent = {
  event: string;
  payload?: Record<string, unknown>;
};

const expectSocketStatusEvent = (status: 'online' | 'offline') => {
  cy.window()
    .its('__dugaCypressSocketEvents')
    .should((events: SocketEvent[] | undefined) => {
      const hasStatusEvent = events?.some(
        (event) => event.event === 'set-status' && event.payload?.status === status
      );

      expect(Boolean(hasStatusEvent), `set-status ${status}`).to.equal(true);
    });
};

describe('settings online status', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('lets the user switch between online and offline', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({
        currentUser: {
          ...currentUser,
          status: 'offline',
        },
      });
      cy.mockDefaultApi({ uploads: [] });

      cy.intercept('GET', /\/users\/online-status\/?(?:\?.*)?$/, {
        statusCode: 200,
        body: { status: 'offline' },
      }).as('getOnlineStatus');

      cy.visitAsAuthenticated('/settings');

      cy.contains('h1', 'Postavke').should('be.visible');
      cy.getByTestId('settings-online-status-form').should('be.visible');
      cy.wait('@getOnlineStatus');
      cy.getByTestId('settings-status-offline').should('be.checked');
      cy.getByTestId('settings-status-online').should('not.be.checked');

      cy.getByTestId('settings-status-online').check({ force: true });

      cy.getByTestId('settings-status-online').should('be.checked');
      cy.contains('Status je uspješno promijenjen na online').should('be.visible');
      expectSocketStatusEvent('online');

      cy.getByTestId('settings-status-offline').check({ force: true });

      cy.getByTestId('settings-status-offline').should('be.checked');
      cy.contains('Status je uspješno promijenjen na offline').should('be.visible');
      expectSocketStatusEvent('offline');
    });
  });
});
