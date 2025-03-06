import RecipeDetail from "../../src/pages/RecipeDetail";
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/router';
import * as apiCalls from "../../src/utils/utils";
import { stub_recipe_1 } from '../stub'

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        query: {
            recipeId: 'stub_recipeid'
        },
        events:{
            on: jest.fn(),
            off: jest.fn()
        }
    })),
}))

jest.mock("next/image")

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    call_api: jest.fn()
}))

describe('The Recipe Detail Page', () => {
    it('shall succesfully render a recipe', async () => {
        //mock api call
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.resolve(stub_recipe_1))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('Recipe_1_name')).toBeInTheDocument()
        expect(container).toMatchSnapshot()
    })
    it('shall render the error page if no recipe id', async () => {
        //mock query route
        (useRouter as jest.Mock).mockImplementationOnce(() => ({
            query: {}
        }))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('Invalid Recipe')).toBeInTheDocument()
    })
    it('shall render the error page if there is a problem with fetching data', async () => {
         //mock api call
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.reject({message: 'Fetch error message'}))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('Fetch error message')).toBeInTheDocument()
    })

    it('shall render the error page if no data is returned', async () => {
         //mock api call
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.resolve(undefined))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('No Recipe Data')).toBeInTheDocument()
    })
})
