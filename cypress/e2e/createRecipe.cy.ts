import { stubRecipeBatch, ingredientListStub } from '../../tests/stub'

describe('End-to-end recipe creation', () => {
  beforeEach(() => {
    cy.mockSession();
    cy.mockGetRecipes()
    cy.mockGetNotifications();

    // Intercept Next.js data request for the CreateRecipe page
    cy.intercept('GET', /_next\/data\/.*\/CreateRecipe\.json/, {
      statusCode: 200,
      body: {
        pageProps: {
          recipeCreationData: {
            ingredientList: ingredientListStub,
            reachedLimit: false,
          },
        },
      },
    }).as('createRecipeData');

  
    cy.fixture('recipes').then((recipes) => {
       // Intercept data request for the Profile page to avoid real SSR
      cy.intercept('GET', /_next\/data\/.*\/Profile\.json/, {
        statusCode: 200,
        body: {
          pageProps: {
            profileData: {
              recipes,
              AIusage: 42,
            }
          }
        },
      });
    });

    cy.intercept('POST', '/api/generate-recipes', {
      statusCode: 200,
      body: {
        recipes: JSON.stringify(stubRecipeBatch),
        openaiPromptId: 'mock-openAI-Prompt-Id',
      },
    }).as('generateRecipes');

    cy.intercept('POST', '/api/save-recipes', {
      statusCode: 200,
      body: { status: 'Saved Recipes and generated the Images!' },
    }).as('saveRecipes');

    cy.login();
  });

  it('creates and submits recipes', () => {
    // Visit home page
    cy.visit('/');

    // Navigate to Create Recipe page
    cy.contains('Create Recipes').click();
    cy.wait('@createRecipeData');
    cy.location('pathname').should('include', '/CreateRecipe');

    // --- Step 1: Select Ingredients ---
    const comboInput = 'input[role="combobox"]';
    cy.get(comboInput).should('be.visible').click().type('Test-Ingredient-1');
    cy.contains('[role="option"]', 'Test-Ingredient-1').click();
    cy.get(comboInput).type('Test-Ingredient-2');
    cy.contains('[role="option"]', 'Test-Ingredient-2').click();
    cy.get(comboInput).type('Test-Ingredient-3');
    cy.contains('[role="option"]', 'Test-Ingredient-3').click();

    // --- Step 2: Dietary Preferences ---
    cy.contains('Step 2: Choose Diet').click();
    cy.contains('Dietary Preferences');
    cy.get('[aria-label="No Dietary Preference"]').click();
    cy.get('[aria-label="Vegan"]').click();

    // --- Step 3: Review & Generate Recipes ---
    cy.contains('Step 3: Review and Create Recipes').click();
    cy.get('button[aria-label="Create recipes based on your selections"]').click()
    cy.wait('@generateRecipes');

    // --- Step 4: Select Recipes & Submit ---
    cy.contains('Use the switch on each recipe generated').should('be.visible');
    cy.get('button[role="switch"]').eq(0).click();
    cy.get('button[role="switch"]').eq(1).click();
    cy.contains('Submit Selected (2) Recipes').click();
    cy.wait('@saveRecipes');

    // Verify navigation back to profile page
    cy.location('pathname').should('include', '/Profile');
  });
});
