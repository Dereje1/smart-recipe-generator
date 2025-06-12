describe('Guest Landing page', () => {
  it('loads the landing page', () => {
    cy.visit('/')
    cy.contains('Cook Smarter with AI')
  })
})
