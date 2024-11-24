import CreateRecipe, { getServerSideProps } from "../../../src/pages/CreateRecipe";
import { fireEvent, render, screen, } from '@testing-library/react'
import * as apiCalls from "../../../src/utils/utils";
import { stubRecipeBatch, ingredientListStub } from "../../stub";

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        query: {}
    })),
}))

jest.mock("../../../src/utils/utils", () => ({
    ...jest.requireActual("../../../src/utils/utils"),
    getServerSidePropsUtility: jest.fn(() => Promise.resolve('mock_serverside_props_return')),
    call_api: jest.fn()
}))

describe('The creating recipes component', () => {
    it('will increase the current step', async () => {
        render(<CreateRecipe recipeCreationData={{ ingredientList: [], reachedLimit: false }} />)
        expect(await screen.findByText('Choose Ingredients')).toBeInTheDocument()
        const nextButton = await screen.findByText('Next')
        fireEvent.click(nextButton)
        expect(await screen.findByText('Choose Diet')).toBeInTheDocument()
    })
    it('will decrease the current step', async () => {
        render(<CreateRecipe recipeCreationData={{ ingredientList: [], reachedLimit: false }} />)
        expect(await screen.findByText('Choose Ingredients')).toBeInTheDocument()
        const nextButton = await screen.findByText('Next')
        fireEvent.click(nextButton)
        expect(await screen.findByText('Choose Diet')).toBeInTheDocument()
        const prevButton = await screen.findByText('Prev')
        fireEvent.click(prevButton)
        expect(await screen.findByText('Choose Ingredients')).toBeInTheDocument()
    })
    it('will not allow recipe creation if limit has been reached', async () => {
        render(<CreateRecipe recipeCreationData={{ ingredientList: [], reachedLimit: true }} />)
        expect(await screen.findByText('Limit Reached')).toBeInTheDocument()
    })
})

describe('Start to finish recipe creation and submission', () => {
    it('.....', async () => {
        //mock recipe creation and submission api
        const getRecipesFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipesFromAPI.mockImplementationOnce(() => Promise.resolve({
            recipes: JSON.stringify(stubRecipeBatch),
            openaiPromptId: "mock-openAI-Prompt-Id"
        }))

        render(<CreateRecipe recipeCreationData={{ ingredientList: ingredientListStub, reachedLimit: false }}/>)
        expect(await screen.findByText('Choose Ingredients')).toBeInTheDocument()
        // click button to show options
        const comboButton = await screen.findAllByRole('button');
        fireEvent.mouseDown(comboButton[3]);
        // choose at least 3 ingredients
        const ingredient1 = await screen.findByRole("option", { name: "Test-Ingredient-1" });
        fireEvent.mouseDown(ingredient1)
        const ingredient2 = await screen.findByRole("option", { name: "Test-Ingredient-2" });
        fireEvent.mouseDown(ingredient2)
        const ingredient3 = await screen.findByRole("option", { name: "Test-Ingredient-3" });
        fireEvent.mouseDown(ingredient3)
        // add dietary preferences
        const nextButton = await screen.findByText('Next')
        fireEvent.click(nextButton)
        expect(await screen.findByText('Choose Diet')).toBeInTheDocument()
        const preferences = screen.getAllByRole('checkbox')
        // first uncheck no prefrences and assert
        fireEvent.click(preferences[0]);
        // add 2 prefrences
        fireEvent.click(preferences[2]);
        fireEvent.click(preferences[4]);
        await screen.findByText('Dietary Preferences')
        // go to next screen to assert selections and submit
        fireEvent.click(nextButton)
        expect(await screen.findByText('Test-Ingredient-1')).toBeInTheDocument()
        expect(await screen.findByText('Test-Ingredient-2')).toBeInTheDocument()
        expect(await screen.findByText('Test-Ingredient-3')).toBeInTheDocument()
        expect(await screen.findByText('Vegan')).toBeInTheDocument()
        expect(await screen.findByText('Keto')).toBeInTheDocument()
        // mock api and submit
        const createRecipesButton = await screen.findByText('Create Recipes')
        fireEvent.click(createRecipesButton);
        // select all recipes and move to submission
        const selectRecipesPage = await screen.findByText('Select Recipes')
        expect(selectRecipesPage).toBeInTheDocument()
        const selectAllButton = screen.getByText('Select All')
        fireEvent.click(selectAllButton);
        fireEvent.click(nextButton)
        const rescipeSubmissionPage = await screen.findByText('Review and Save Recipes')
        expect(rescipeSubmissionPage).toBeInTheDocument()
        const submitRecipesButton = await screen.findByText('Submit Selected Recipes')
        fireEvent.click(submitRecipesButton)
        // goes back to ingredient page as router push to home is mocked
        await screen.findByText('Choose Ingredients')
        expect(routePushMock).toHaveBeenCalledWith('/Profile')
        expect(getRecipesFromAPI).toHaveBeenNthCalledWith(1, {
            "address": "/api/generate-recipes",
            "method": "post",
            "payload": {
                "dietaryPreferences": ["Vegan", "Keto"],
                "ingredients": ingredientListStub.map(({ name }) => ({ id: expect.any(String), name }))
            }
        })
        expect(getRecipesFromAPI).toHaveBeenNthCalledWith(2, {
            "address": "/api/save-recipes",
            "method": "post",
            "payload": {
                recipes: [
                    {
                        ...stubRecipeBatch[0],
                        openaiPromptId: 'mock-openAI-Prompt-Id-0'
                    },
                    {
                        ...stubRecipeBatch[1],
                        openaiPromptId: 'mock-openAI-Prompt-Id-1'
                    },
                ]
            }
        })
    })
})


describe('updating the serverside props', () => {
    it('shall update', async () => {
        const response = await getServerSideProps('' as any);
        expect(response).toBe('mock_serverside_props_return')
    })
})