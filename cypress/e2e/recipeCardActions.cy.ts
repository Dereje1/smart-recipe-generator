import { ingredientListStub } from '../../tests/stub'

describe('Recipe Card Actions', () => {
  let recipes: any[];

  beforeEach(() => {
    cy.fixture('recipes').then((data) => {
      recipes = data;
    });

    cy.mockSession();
    cy.mockGetRecipes();
    cy.mockGetNotifications();
    cy.login();
  });

  describe('Open Recipe', () => {
    it('navigates to recipe detail page', () => {
      cy.visit('/Home');

      cy.window().then((win) => {
        cy.stub(win, 'open').callsFake((url) => {
          win.location.href = url;
        }).as('windowOpen');
      });

      const first = recipes[0];

      cy.intercept('GET', '/api/get-single-recipe*', {
        statusCode: 200,
        body: first,
      });

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Open Recipe').click();

      cy.location('pathname').should('eq', '/RecipeDetail');
      cy.location('search').should('eq', `?recipeId=${first._id}`);
      cy.contains(first.name).should('be.visible');
    });
  });

  describe('Copy Link', () => {
    it('copies recipe link to clipboard', () => {
      cy.visit('/Home');

      cy.window().then((win) => {
        if (!win.navigator.clipboard) {
          (win as any).navigator.clipboard = { writeText: () => Promise.resolve() };
        }
        cy.stub(win.navigator.clipboard, 'writeText').as('clipboard');
      });

      const first = recipes[0];

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Copy Link').click();

      cy.get('@clipboard').should('have.been.calledWith', `http://localhost:3000/RecipeDetail?recipeId=${first._id}`);

      cy.get('p.leading-tight').invoke('text').should('include', `${first.name} copied to clipboard!`);
    });
  });

  describe('Chat with Assistant', () => {
    it('navigates to the assistant chat page', () => {
      cy.visit('/Home');

      const first = recipes[0];

      cy.intercept('GET', '/api/get-single-recipe*', {
        statusCode: 200,
        body: first,
      });

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Chat with Assistant').click();

      cy.location('pathname').should('eq', '/ChatAssistant');
      cy.location('search').should('eq', `?recipeId=${first._id}`);
      cy.contains('Ask the AI Assistant').should('be.visible');
      cy.contains(first.name).should('be.visible');
    });
  });

  describe('Clone Ingredients', () => {
    it('opens create recipe with cloned ingredients', () => {
      cy.visit('/Home');

      const first = recipes[0];

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

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Clone Ingredients').click();

      cy.wait('@createRecipeData');
      cy.location('pathname').should('eq', '/CreateRecipe');
      cy.location('search').then((search) => {
        const params = new URLSearchParams(search);
        expect(params.getAll('oldIngredients')).to.deep.equal(
          first.ingredients.map((i: any) => i.name)
        );
      });
    });
  });

  describe('Play Recipe', () => {
    it('plays recipe audio', () => {
      cy.visit('/Home');

      cy.window().then((win) => {
        const playStub = cy.stub().as('audioPlay').resolves();
        cy.stub(win, 'Audio').callsFake(() => {
          const audio: any = {
            load: () => {
              setTimeout(() => {
                if (typeof audio.oncanplaythrough === 'function') {
                  audio.oncanplaythrough();
                }
              }, 50); // give React time to attach the handler
            },
            play: playStub,
            preload: 'auto',
            oncanplaythrough: undefined,
            onended: undefined,
            onerror: undefined,
          };
          return audio;
        });
      });

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Play Recipe').click();

      cy.get('@audioPlay').should('have.been.called');
      cy.contains('button', 'Stop Playing').should('be.visible');
    });
  });

  describe('Delete Recipe', () => {
    it('deletes a recipe', () => {
      cy.visit('/Home');

      const first = recipes[0];

      cy.intercept('DELETE', `/api/delete-recipe?recipeId=${first._id}`, {
        statusCode: 200,
        body: { message: `Deleted recipe with id ${first._id}` },
      }).as('deleteRecipe');

      cy.contains('See Recipe').first().click();
      cy.get('button[id^="headlessui-popover-button"]').eq(1).click({ force: true });
      cy.contains('button', 'Delete Recipe').click();
      cy.contains('button', 'Delete').click();

      cy.wait('@deleteRecipe');
      cy.contains(first.name).should('not.exist');
    });
  });
});