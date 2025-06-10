Cypress.Commands.add('login', () => {
  cy.request('GET', '/api/test-login')
})

Cypress.Commands.add('mockSession', () => {
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        id: 'test-id-123',
        image: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
      },
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    },
  });
});

Cypress.Commands.add('mockGetRecipes', () => {
  cy.fixture('recipes').then((recipes) => {
    cy.intercept('GET', '/api/get-recipes*', {
      statusCode: 200,
      body: {
        recipes: recipes,
        currentPage: 1,
        totalPages: 1,
        popularTags: [{ _id: "vegan", count: 3 }, { _id: "glutenfree", count: 5 }, { _id: "snack", count: 1 }],
      },
    });
  });
});

Cypress.Commands.add('mockGetNotifications', () => {
  cy.intercept('GET', '/api/get-notifications', {
    statusCode: 200,
    body: [],
  });
});