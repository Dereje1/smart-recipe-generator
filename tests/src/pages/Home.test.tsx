import Home, { getServerSideProps } from "../../../src/pages/Home";
import { useSession } from "next-auth/react"
import { fireEvent, render, screen } from '@testing-library/react'
import { stubRecipeBatch } from "../../stub";

jest.mock("next-auth/react")
jest.mock("../../../src/utils/utils", () => ({
    ...jest.requireActual("../../../src/utils/utils"),
    getServerSidePropsUtility: jest.fn(() => Promise.resolve('mock_serverside_props_return'))
}))

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

describe('The home component', () => {
    beforeEach(() => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return {
                data: {
                    user: {
                        name: "mockuser",
                        image: "https://www.mockimage",
                        email: "mockEmail"
                    },
                },
                status: 'authenticated'
            };
        });
    })
    it('shall render', () => {
        render(<Home recipes={stubRecipeBatch} />)
        expect(screen.getByText('Search')).toBeInTheDocument()
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument()
    })

    it('shall update the search input box', async () => {
        render(<Home recipes={stubRecipeBatch} />)
        const input = await screen.findByPlaceholderText('Search...')
        fireEvent.change(input, { target: { value: 'test-search' } })
        expect(input.getAttribute('value')).toBe('test-search')
    })

    it('shall execute the search term', async () => {
        render(<Home recipes={stubRecipeBatch} />)
        const searchButton = await screen.findByText('Search')
        fireEvent.click(searchButton)
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument()
    })
    it('shall execute the search term', async () => {
        render(<Home recipes={stubRecipeBatch} />)
        const searchButton = await screen.findByText('Search')
        fireEvent.click(searchButton)
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument()
    })
})


describe('updating the serverside props', () => {
    it('shall update', async () => {
        const response = await getServerSideProps('' as any);
        expect(response).toBe('mock_serverside_props_return')
    })
})