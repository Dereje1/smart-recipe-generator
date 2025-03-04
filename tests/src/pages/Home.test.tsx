import Home from "../../../src/pages/Home";
import { fireEvent, render, screen } from '@testing-library/react'
import { stubRecipeBatch } from "../../stub";
import * as apiCalls from "../../../src/utils/utils";

jest.mock("../../../src/utils/utils", () => ({
    ...jest.requireActual("../../../src/utils/utils"),
    getServerSidePropsUtility: jest.fn(() => Promise.resolve('mock_serverside_props_return')),
    call_api: jest.fn()
}))

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        events: {
            on: jest.fn(),
            off: jest.fn()
        }
    })),
}))

describe('The home component', () => {
    let getRecipesFromAPI;
    beforeEach(() => {
    //mock recipe retrieval
        getRecipesFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipesFromAPI.mockImplementationOnce(() => Promise.resolve({recipes: stubRecipeBatch}))
    });
    afterEach(()=>{
        getRecipesFromAPI = null;
    })
    it('shall render', async () => {
        render(<Home />)
        await screen.findByText('Search')
        expect(screen.getByText('Search')).toBeInTheDocument()
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument()
    })

    it('shall update the search input box', async () => {
        render(<Home />)
        const input = await screen.findByPlaceholderText('Search recipes by name, ingredient, or type...')
        fireEvent.change(input, { target: { value: 'test-search' } })
        expect(input.getAttribute('value')).toBe('test-search')
    })

    it('shall execute the search term', async () => {
        render(<Home />)
        const searchButton = await screen.findByText('Search')
        fireEvent.click(searchButton)
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument()
    })
    it('shall execute an empty search and clear the search box', async () => {
        render(<Home />)
        const input = await screen.findByPlaceholderText('Search recipes by name, ingredient, or type...')
        fireEvent.change(input, { target: { value: 'test-search' } })
        // make sure recipes are there before firing
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument()
        expect(screen.getByText('Recipe_2_name')).toBeInTheDocument()
        const searchButton = await screen.findByText('Search')
        // make sure no matches are found and screen is cleared after executing empty search
        fireEvent.click(searchButton)
        expect(screen.queryByText('Recipe_1_name')).not.toBeInTheDocument()
        const clearButton = await screen.findAllByRole('button')
        // make sure recipes are back after executing clear
        fireEvent.click(clearButton[0])
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument()
    })
})