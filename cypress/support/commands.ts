Cypress.Commands.add('login', () => {
  cy.request('GET', '/api/test-login')
})
