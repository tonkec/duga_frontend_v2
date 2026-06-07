/// <reference types="cypress" />

export {};

describe('report problem', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('allows an authenticated user to submit a problem report', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.mockAuthenticatedSession({ currentUser });
      cy.mockDefaultApi({ forumQuestions: [] });

      cy.intercept('POST', /\/reports\/?(?:\?.*)?$/, (req) => {
        expect(req.body).to.deep.equal({
          problemType: 'harassment',
          message: 'Korisnik mi salje prijetece poruke u chatu.',
        });

        req.reply({
          statusCode: 201,
          body: { ok: true },
        });
      }).as('submitProblemReport');

      cy.visitAsAuthenticated('/report');

      cy.contains('h1', 'Prijavi problem').should('be.visible');
      cy.get('#report-problem-type').click({ force: true }).type('Uznemiravanje{enter}');
      cy.contains('Uznemiravanje, prijetnje ili govor mržnje').should('be.visible');
      cy.get('textarea[placeholder="Opiši problem što detaljnije..."]').type(
        'Korisnik mi salje prijetece poruke u chatu.'
      );
      cy.contains('button', 'Pošalji prijavu').click();

      cy.wait('@submitProblemReport');
      cy.contains('Hvala! Tvoja prijava je poslana.').should('be.visible');
    });
  });
});
