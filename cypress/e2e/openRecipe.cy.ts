describe('Open Recipe from card', () => {
  beforeEach(() => {
    cy.mockSession();
    cy.mockGetRecipes();
    cy.mockGetNotifications();
    cy.login();
    cy.fixture('recipes').as('recipes');
  });

  it('navigates to recipe detail page', function () {
    const first = this.recipes[0];
    cy.visit('/Home');

    // stub window.open to stay in same tab
    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => {
        win.location.href = url;
      }).as('windowOpen');
    });

    // Open the first recipe dialog
    cy.contains('See Recipe').first().click();

    // Open action menu and click "Open Recipe"
    cy.get('button[aria-expanded="false"]').first().click({ force: true });
    cy.contains('button', 'Open Recipe').click({ force: true });

    // verify navigation
    cy.location('pathname').should('eq', '/RecipeDetail');
    cy.location('search').should('eq', `?recipeId=${first._id}`);
  });
});
