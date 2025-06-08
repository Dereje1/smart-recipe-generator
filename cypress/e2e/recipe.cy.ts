/// <reference types="cypress" />

describe('Recipe creation flow', () => {
  it('loads homepage', () => {
    cy.visit('/')
    cy.contains('Smart Recipe Generator')
  })
})
