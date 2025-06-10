
describe('Logged-in user flow', () => {
  beforeEach(() => {
    cy.mockSession();
    cy.mockGetRecipes()
    cy.mockGetNotifications();

    cy.login();
  });

  it('should load the homepage without crashing', () => {
    cy.visit('/');
    cy.get('.spinner, .loading, [data-testid="spinner"]').should('not.exist');
    cy.contains('Buy Me a Coffee');
  });
});
