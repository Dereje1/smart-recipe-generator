describe('Recipe creation flow', () => {
  it('loads the homepage', () => {
    cy.visit('/')
    cy.contains('Smart Recipe Generator')
  })
})
