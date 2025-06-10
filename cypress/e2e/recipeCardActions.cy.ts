describe('Recipe Card Actions', () => {
  let recipes: any[];

  beforeEach(() => {
    cy.fixture('recipes').then((data) => {
      recipes = data;
    });

    cy.mockSession();
    cy.mockGetRecipes();
    cy.mockGetNotifications();
    cy.login();
  });

  describe('Open Recipe', () => {
    it('navigates to recipe detail page', () => {
      cy.visit('/Home');

      cy.window().then((win) => {
        cy.stub(win, 'open').callsFake((url) => {
          win.location.href = url;
        }).as('windowOpen');
      });

      const first = recipes[0];

      cy.intercept('GET', '/api/get-single-recipe*', {
        statusCode: 200,
        body: first,
      });

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Open Recipe').click();

      cy.location('pathname').should('eq', '/RecipeDetail');
      cy.location('search').should('eq', `?recipeId=${first._id}`);
      cy.contains(first.name).should('be.visible');
    });
  });
});
