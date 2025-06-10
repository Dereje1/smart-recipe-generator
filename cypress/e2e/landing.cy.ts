describe('Guest Landing page', () => {
  it('loads the landing page', () => {
    cy.visit('/')
    cy.contains('Generate Delicious Recipes with Your Ingredients')
  })
})
