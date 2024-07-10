import Header from "../../../src/components/Header";
import { render, screen, fireEvent } from '@testing-library/react'


const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

jest.mock("next/image")

describe('The Header', () => {
    it('renders', () => {
        const { container } = render(
            <Header user={{ name: 'mock username' }} />
        )
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Create Recipes')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
    })

    it('will navigate to the /Home route', () => {
        const { container } = render(
            <Header user={{ name: 'mock username' }} />
        )
        fireEvent.click(screen.getByText('Home'));
        expect(routePushMock).toHaveBeenCalledWith('/Home')
    })

    it('will open about link', () => {
        global.open = jest.fn();
        const { container } = render(
            <Header user={{ name: 'mock username' }} />
        )
        fireEvent.click(screen.getByText('About'));
        expect(global.open).toHaveBeenCalledWith("https://github.com/Dereje1", "_blank")
    })
    it('will be empty for a missing user', () => {
        const { container } = render(
            <Header user={undefined} />
        )
        expect(container.firstChild).toBeNull();
    })

})