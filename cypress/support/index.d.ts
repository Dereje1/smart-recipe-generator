/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
    mockSession(): Chainable<void>;
    mockGetRecipes(): Chainable<void>;
    mockGetNotifications(): Chainable<void>;
  }
}
