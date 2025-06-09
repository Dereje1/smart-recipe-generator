import CreateRecipe, { getServerSideProps } from "../../src/pages/CreateRecipe";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as apiCalls from "../../src/utils/utils";
import { stubRecipeBatch, ingredientListStub } from "../stub";

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        query: {}
    })),
}))

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    getServerSidePropsUtility: jest.fn(() => Promise.resolve('mock_serverside_props_return')),
    call_api: jest.fn()
}))

describe('The creating recipes component', () => {
    it('will increase the current step', async () => {
        render(<CreateRecipe recipeCreationData={{ ingredientList: [], reachedLimit: false }} />)
        expect(await screen.findByText('Step 1: Choose Ingredients')).toBeInTheDocument()
        const step2Header = await screen.findByText('Step 2: Choose Diet')
        fireEvent.click(step2Header)
        expect(await screen.findByText('Dietary Preferences')).toBeInTheDocument()
    })
    it('will decrease the current step', async () => {
        render(<CreateRecipe recipeCreationData={{ ingredientList: [], reachedLimit: false }} />)
        expect(await screen.findByText('Step 1: Choose Ingredients')).toBeInTheDocument()
        const step2Header = await screen.findByText('Step 2: Choose Diet')
        fireEvent.click(step2Header)
        expect(await screen.findByText('Dietary Preferences')).toBeInTheDocument()
        const step1Header = await screen.findByText('Step 1: Choose Ingredients')
        fireEvent.click(step1Header)
        expect(await screen.findByText('Add New Ingredient')).toBeInTheDocument()
    })

    it('hides recipe selection until recipes exist', async () => {
        render(<CreateRecipe recipeCreationData={{ ingredientList: [], reachedLimit: false }} />)
        expect(screen.queryByText('Use the switch on each recipe to select or unselect.')).not.toBeInTheDocument()
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

        render(<CreateRecipe recipeCreationData={{ ingredientList: ingredientListStub, reachedLimit: false }} />)
        expect(await screen.findByText('Step 1: Choose Ingredients')).toBeInTheDocument()
        // Select at least 3 ingredients from the combobox
        const comboInput = screen.getByRole('combobox')
        fireEvent.change(comboInput, { target: { value: 'Test-Ingredient-1' } });
        const ingredient1 = await screen.findByRole('option', { name: 'Test-Ingredient-1' });
        fireEvent.click(ingredient1);
        fireEvent.change(comboInput, { target: { value: 'Test-Ingredient-2' } });
        const ingredient2 = await screen.findByRole('option', { name: 'Test-Ingredient-2' });
        fireEvent.click(ingredient2);
        fireEvent.change(comboInput, { target: { value: 'Test-Ingredient-3' } });
        const ingredient3 = await screen.findByRole('option', { name: 'Test-Ingredient-3' });
        fireEvent.click(ingredient3);
        // move to dietary preferences
        const step2Header = await screen.findByText('Step 2: Choose Diet')
        fireEvent.click(step2Header)
        expect(await screen.findByText('Dietary Preferences')).toBeInTheDocument()
        const preferences = screen.getAllByRole('checkbox')
        // first uncheck no prefrences and assert
        fireEvent.click(preferences[0]);
        // add 2 prefrences
        fireEvent.click(preferences[2]);
        fireEvent.click(preferences[4]);
        await screen.findByText('Dietary Preferences')
        // go to review screen to assert selections and submit
        const step3Header = await screen.findByText('Step 3: Review and Create Recipes')
        fireEvent.click(step3Header)
        expect(await screen.findByText('Test-Ingredient-1')).toBeInTheDocument()
        expect(await screen.findByText('Test-Ingredient-2')).toBeInTheDocument()
        expect(await screen.findByText('Test-Ingredient-3')).toBeInTheDocument()
        expect(await screen.findByText('Vegan')).toBeInTheDocument()
        expect(await screen.findByText('Dairy-Free')).toBeInTheDocument()
        // mock api and submit
        const createRecipesButton = await screen.findByText('Create Recipes')
        fireEvent.click(createRecipesButton);
        await screen.findByText(/Use the switch on each recipe generated to select the recipes you want to submit./)
        const switches = await screen.findAllByRole('switch')
        fireEvent.click(switches[0]);
        fireEvent.click(switches[1]);
        const submitRecipesButton = await screen.findByText('Submit Selected (2) Recipes')
        fireEvent.click(submitRecipesButton)
        // goes back to ingredient page as router push to home is mocked
        await screen.findByText('Step 1: Choose Ingredients')
        await waitFor(() => expect(routePushMock).toHaveBeenCalledWith('/Profile'))
        expect(getRecipesFromAPI).toHaveBeenNthCalledWith(1, {
            "address": "/api/generate-recipes",
            "method": "post",
            "payload": {
                "dietaryPreferences": ["Vegan", "Dairy-Free"],
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