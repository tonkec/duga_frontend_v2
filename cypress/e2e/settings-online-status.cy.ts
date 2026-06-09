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

  it('toggles theme, updates cookie consent, and confirms profile deletion', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({
        currentUser: {
          ...currentUser,
          status: 'online',
        },
      });
      cy.mockDefaultApi({ uploads: [] });

      cy.intercept('GET', /\/users\/online-status\/?(?:\?.*)?$/, {
        statusCode: 200,
        body: { status: 'online' },
      });

      cy.intercept('DELETE', /\/delete-user\/?(?:\?.*)?$/, {
        statusCode: 200,
        body: { ok: true },
      }).as('deleteUser');

      cy.visitAsAuthenticated('/settings');

      cy.contains('h1', 'Postavke').should('be.visible');
      cy.get('[role="switch"]').should('have.attr', 'aria-checked', 'false').click();
      cy.get('[role="switch"]').should('have.attr', 'aria-checked', 'true');
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      cy.get('[role="switch"]').click();
      cy.get('[role="switch"]').should('have.attr', 'aria-checked', 'false');
      cy.get('html').should('have.attr', 'data-theme', 'light');

      cy.contains('button', 'Odbij kolačiće').click();
      cy.contains('Odbiti kolačiće?').should('be.visible');
      cy.contains('button', 'Natrag').click();
      cy.contains('button', 'Odbij kolačiće').click();
      cy.contains('button', 'Potvrđujem').click();
      cy.contains('Neke funkcije neće raditi jer ste odbili kolačiće.').should('be.visible');
      cy.contains('button', 'Prihvati kolačiće').click();
      cy.contains('Kolačići su prihvaćeni.').should('be.visible');

      cy.contains('button', 'Obriši profil').click();
      cy.contains('Obrisati profil?').should('be.visible');
      cy.contains('button', 'Natrag').click();
      cy.contains('button', 'Obriši profil').click();
      cy.contains('button', 'Potvrđujem').click();
      cy.wait('@deleteUser');
      cy.location('pathname').should('eq', '/login');
    });
  });
});
