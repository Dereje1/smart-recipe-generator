// E2E tests for sorting recipes by newest and popular

describe('Recipe sorting', () => {
  beforeEach(() => {
    cy.mockSession();
    cy.mockGetNotifications();

    cy.fixture('recipes').then((popular) => {
      cy.intercept('GET', '/api/get-recipes?page=1&limit=12&sortOption=popular', {
        statusCode: 200,
        body: {
          recipes: popular,
          currentPage: 1,
          totalPages: 1,
          popularTags: [],
          totalRecipes: popular.length,
        },
      }).as('getPopular');
    });

    cy.fixture('recipesPage2').then((recent) => {
      cy.intercept('GET', '/api/get-recipes?page=1&limit=12&sortOption=recent', {
        statusCode: 200,
        body: {
          recipes: recent,
          currentPage: 1,
          totalPages: 1,
          popularTags: [],
          totalRecipes: recent.length,
        },
      }).as('getRecent');
    });

    cy.login();
  });

  it('sorts by newest and switches back to popular', () => {
    cy.visit('/Home');

    cy.wait('@getPopular');
    cy.contains('Blueberry Apple Smoothie').should('be.visible');

    cy.contains('button', 'Most Recent').click();
    cy.wait('@getRecent');
    cy.contains('Recipe_1_name').should('be.visible');

    cy.contains('button', 'Most Popular').click();
    cy.wait('@getPopular');
    cy.contains('Blueberry Apple Smoothie').should('be.visible');
  });
});
