import Profile, { getServerSideProps } from "../../src/pages/Profile";
import { fireEvent, render, screen } from '@testing-library/react'
import { stubRecipeBatch } from "../stub";

/* ProfileInformation sub-component needs to use useSession */
jest.mock("next-auth/react", () => ({
    ...jest.requireActual('next-auth/react'),
    useSession: jest.fn(() => ({
        data: {
            user: {
                name: "mockuser",
                image: "https://www.mockimage",
                email: "mockEmail"
            },
        },
        status: 'authenticated'
    }))
}))

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    getServerSidePropsUtility: jest.fn(() => Promise.resolve('mock_serverside_props_return'))
}))

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        events:{
            on: jest.fn(),
            off: jest.fn()
        }
    })),
}))

describe('The Profile component', () => {
    it('shall render for own recipes', () => {
        const { container } = render(<Profile profileData={{ recipes: stubRecipeBatch, AIusage: 40 }} />)
        expect(container).toMatchSnapshot()
    })
    it('shall render for favorite recipes', async () => {
        const { container } = render(<Profile profileData={{ recipes: stubRecipeBatch, AIusage: 40 }} />)
        const favoritesButton = await screen.findByText('Favorites');
        fireEvent.click(favoritesButton);
        const likedRecipe = await screen.findByText('Recipe_2_name')
        expect(likedRecipe).toBeInTheDocument()
    })
    it('shall render for favorite recipes', async () => {
        const { container } = render(<Profile profileData={{ recipes: stubRecipeBatch, AIusage: 40 }} />)
        const votesReceivedButton = await screen.findByText('Votes Received');
        fireEvent.click(votesReceivedButton);
        const likedRecipe = await screen.findByText('Recipe_1_name')
        expect(likedRecipe).toBeInTheDocument()
    })
})


describe('updating the serverside props', () => {
    it('shall update', async () => {
        const response = await getServerSideProps('' as any);
        expect(response).toBe('mock_serverside_props_return')
    })
})