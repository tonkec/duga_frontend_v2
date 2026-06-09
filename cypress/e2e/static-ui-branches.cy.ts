/// <reference types="cypress" />

export {};

const currentUser = {
  id: 1,
  publicId: 'user-current',
  username: 'cypress_user',
  onboarding_done: true,
  isVerified: true,
};

const setupAuthenticatedStaticPage = () => {
  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ users: [currentUser], forumQuestions: [] });
};

describe('static and low-cost UI branches', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('opens, switches, and closes login FAQ accordion items', () => {
    cy.visit('/login');
    cy.contains('Česta pitanja').scrollIntoView().should('be.visible');

    cy.contains('button', 'Mogu li izbrisati svoj profil kad god poželim?').click({ force: true });
    cy.contains('Da, profil možeš izbrisati u bilo kojem trenutku putem postavki računa.').should(
      'be.visible'
    );

    cy.contains('button', 'Kako funkcionira registracija na Dugu?').click({ force: true });
    cy.contains(
      'Registracija je brza i jednostavna, potrebno je samo unijeti osnovne podatke'
    ).should('be.visible');
    cy.contains('Da, profil možeš izbrisati u bilo kojem trenutku putem postavki računa.').should(
      'not.exist'
    );

    cy.contains('button', 'Kako funkcionira registracija na Dugu?').click({ force: true });
    cy.contains(
      'Registracija je brza i jednostavna, potrebno je samo unijeti osnovne podatke'
    ).should('not.exist');
  });

  it('navigates public policy sections and footer links from the landing page', () => {
    cy.visit('/login');
    cy.contains('a', 'Politika privatnosti').click({ force: true });
    cy.location('pathname').should('eq', '/privacy-policy');
    cy.contains('h1', 'Politika privatnosti').should('be.visible');
    cy.contains('a', 'Podaci').click();
    cy.location('hash').should('eq', '#podaci');
    cy.contains('Podaci koje prikupljamo').should('be.visible');

    cy.visit('/terms-of-use#ponasanje');
    cy.contains('h1', 'Pravila upotrebe').should('be.visible');
    cy.contains('Ponašanje korisnika').should('be.visible');
    cy.contains('a', 'Sadržaj').click();
    cy.location('hash').should('eq', '#sadrzaj');

    cy.visit('/cookie-policy#upravljanje');
    cy.contains('h1', 'Politika kolačića').should('be.visible');
    cy.contains('Upravljanje kolačićima').should('be.visible');
  });

  it('navigates authenticated help sections', () => {
    setupAuthenticatedStaticPage();

    cy.visitAsAuthenticated('/help');
    cy.contains('h1', 'Sve bitno o korištenju Duge').should('be.visible');
    cy.contains('a', 'Featurei').click({ force: true });
    cy.location('hash').should('eq', '#featurei');
    cy.contains('Osnovni featurei koje Duga ima').should('be.visible');
    cy.contains('a', 'Sigurnost').click({ force: true });
    cy.location('hash').should('eq', '#sigurnost');
    cy.contains('Aplikacija je sigurna').should('be.visible');
  });
});
