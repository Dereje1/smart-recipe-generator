import withAuth from "../../src/components/withAuth";
import { useSession } from "next-auth/react"
import { render, screen, fireEvent } from '@testing-library/react'

jest.mock("next-auth/react")

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

function MockApp() {
    return <p>Mock App</p>
}

const MockWithHOC = withAuth(MockApp);

describe('The withAuth HOC', () => {
    it('renders child component if authenticated ', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return { data: {user: { username: "admin" }}, status: 'authenticated' };
          });
        const { container } = render(
            <MockWithHOC />
        )
        expect(screen.getByText('Mock App')).toBeInTheDocument();
    })

    it('It goes back to the home route if not authenticated ', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return { data: null, status: 'authenticated' };
          });
        const { container } = render(
            <MockWithHOC />
        )
        expect(routePushMock).toHaveBeenCalledWith('/')
    })

    it('renders loading component if session data is not ready', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return { data: {user: { username: "admin" }}, status: 'loading' };
          });
        const { container } = render(
            <MockWithHOC />
        )
        expect(container).toMatchSnapshot()
    })
})