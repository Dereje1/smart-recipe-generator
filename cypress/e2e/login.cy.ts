describe('Logged-in user flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          id: 'test-id-123',
        },
        expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      },
    });

    cy.intercept('GET', '/api/get-recipes*', {
      statusCode: 200,
      body: {
        recipes: [],
        currentPage: 1,
        totalPages: 1,
        popularTags: [],
      },
    });

    cy.intercept('GET', '/api/get-notifications', {
      statusCode: 200,
      body: [],
    });

    cy.login();
  });

  it('should load the homepage without crashing', () => {
    cy.visit('/');
    cy.get('.spinner, .loading, [data-testid="spinner"]').should('not.exist');
    cy.contains('Buy Me a Coffee');
  });
});
