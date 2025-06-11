describe('Search and filter recipes', () => {

  beforeEach(() => {
    cy.mockSession();
    cy.mockGetRecipes();
    cy.mockGetNotifications();

    cy.fixture('recipes').then((data) => {
      cy.intercept(
        'GET',
        '/api/search-recipes?query=vegan&page=1&limit=12',
        {
          statusCode: 200,
          body: {
            recipes: [data[0]],
            currentPage: 1,
            totalPages: 1,
            popularTags: [],
            totalRecipes: 1,
          },
        }
      ).as('searchRecipes');
    });

    cy.login();
  });

  it('searches via the input field and clears the search', () => {
    cy.visit('/Home');

    cy.get('.recipe-card').should('have.length', 2);

    cy.get('input[placeholder^="Search recipes"]').type('vegan');
    cy.contains('button', 'Search').click();
    cy.wait('@searchRecipes');

    cy.get('.recipe-card').should('have.length', 1);

    cy.get('input[placeholder^="Search recipes"]').parent().find('button').click({ force: true });

    cy.get('.recipe-card').should('have.length', 2);
  });

  it('filters recipes using a popular tag', () => {
    cy.visit('/Home');

    cy.contains('button', 'vegan (3)').click();
    cy.wait('@searchRecipes');

    cy.get('.recipe-card').should('have.length', 1);

    cy.contains('button', 'vegan (3)').click();

    cy.get('.recipe-card').should('have.length', 2);
  });
});
