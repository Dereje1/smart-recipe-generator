import Home from "../../src/pages/Home";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { stubRecipeBatch } from "../stub";
import * as apiCalls from "../../src/utils/utils";

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
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
    let getRecipesFromAPI: any;
    beforeAll(() => {
        global.IntersectionObserver = class IntersectionObserver {
            constructor() { }
            observe() { }
            unobserve() { }
            disconnect() { }
        } as any;
    });
    beforeEach(() => {
        //mock recipe retrieval
        getRecipesFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipesFromAPI.mockResolvedValue({ recipes: stubRecipeBatch, popularTags: [], currentPage: 1 });
    });
    afterEach(() => {
        getRecipesFromAPI = null;
    })
    it('shall render', async () => {
        render(<Home />)
        await screen.findByText('Search')
        expect(screen.getByText('Search')).toBeInTheDocument()
        expect(await screen.findByText('Recipe_1_name')).toBeInTheDocument()
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
        getRecipesFromAPI.mockClear();
        getRecipesFromAPI.mockResolvedValue({ recipes: [], popularTags: [], currentPage: 1 })
        render(<Home />)
        const input = await screen.findByPlaceholderText('Search recipes by name, ingredient, or type...')
        fireEvent.change(input, { target: { value: 'test-search' } })
        const searchButton = await screen.findByText('Search')

        fireEvent.click(searchButton)
        await waitFor(() => {
            expect(screen.queryByText('Recipe_1_name')).not.toBeInTheDocument()
        })
        const clearButton = screen.getAllByRole('button')
        // must remock the api returning when
        getRecipesFromAPI.mockClear();
        getRecipesFromAPI.mockResolvedValue({ recipes: stubRecipeBatch, popularTags: [], currentPage: 1 })
        // make sure recipes are back after executing clear
        fireEvent.click(clearButton[0])
        await waitFor(() => {
            expect(screen.queryByText('Recipe_1_name')).toBeInTheDocument()
        })
    })
    it('shall filter by recent', async () => {
        render(<Home />)
        const recentButton = await screen.findByText('Most Recent')
        fireEvent.click(recentButton)
        expect(await screen.findByText('Recipe_1_name')).toBeInTheDocument()
        expect(getRecipesFromAPI.mock.calls).toEqual([
            [
                {
                    address: '/api/get-recipes?page=1&limit=12&sortOption=popular',
                }
            ],
            [
                {
                    address: '/api/get-recipes?page=1&limit=12&sortOption=recent',
                }
            ],
        ]
        )
    })
})