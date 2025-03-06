import LimitReached from "../../../src/components/Recipe_Creation/LimitReached";
import { fireEvent, render, screen } from '@testing-library/react'

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

describe('The Limit Reached Component', () => {
    it('shall render', () => {
        const { container } = render(<LimitReached />)
        expect(container).toMatchSnapshot()
    })
    it('shall go back home', async () => {
        render(<LimitReached />)
        const homeButton = await screen.findByText('Go to Home')
        fireEvent.click(homeButton)
        expect(routePushMock).toHaveBeenCalledWith('/')
    })
})