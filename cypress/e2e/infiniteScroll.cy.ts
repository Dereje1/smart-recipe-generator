
// Infinite scroll test for Home page

describe('Home page infinite scrolling', () => {
  beforeEach(() => {
    cy.mockSession();
    cy.mockGetNotifications();

    cy.fixture('recipes').then((page1) => {
      cy.intercept('GET', '/api/get-recipes?page=1&limit=12&sortOption=popular', {
        statusCode: 200,
        body: {
          recipes: page1,
          currentPage: 1,
          totalPages: 2,
          popularTags: [],
          totalRecipes: 4,
        },
      }).as('getRecipesPage1');
    });

    cy.fixture('recipesPage2').then((page2) => {
      cy.intercept('GET', '/api/get-recipes?page=2&limit=12&sortOption=popular', {
        statusCode: 200,
        body: {
          recipes: page2,
          currentPage: 2,
          totalPages: 2,
          popularTags: [],
          totalRecipes: 4,
        },
      }).as('getRecipesPage2');
    });

    cy.login();
  });

  it('loads more recipes when scrolling to the bottom', () => {
    cy.visit('/Home');

    cy.wait('@getRecipesPage1');
    cy.get('.recipe-card').should('have.length', 2);

    cy.get('.recipe-card').last().scrollIntoView();
    cy.wait('@getRecipesPage2');

    cy.get('.recipe-card').should('have.length', 4);
  });
});
