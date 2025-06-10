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

  describe('Copy Link', () => {
    it('copies recipe link to clipboard', () => {
      cy.visit('/Home');

      cy.window().then((win) => {
        if (!win.navigator.clipboard) {
          (win as any).navigator.clipboard = { writeText: () => Promise.resolve() };
        }
        cy.stub(win.navigator.clipboard, 'writeText').as('clipboard');
      });

      const first = recipes[0];

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Copy Link').click();

      cy.contains(`${first.name} copied to clipboard!`).should('be.visible');
    });
  });
});
