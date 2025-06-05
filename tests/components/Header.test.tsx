import Header from "../../src/components/Header";
import { render, screen, fireEvent } from '@testing-library/react'
import { signOut } from 'next-auth/react'


const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

jest.mock("next/image")
jest.mock("next-auth/react", () => ({
    signOut: jest.fn()
}))

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
        expect(global.open).toHaveBeenCalledWith("https://github.com/Dereje1/smart-recipe-generator", "_blank")
    })
    it('will be empty for a missing user', () => {
        const { container } = render(
            <Header user={undefined} />
        )
        expect(container.firstChild).toBeNull();
    })

    it('will navigate to the /CreateRecipe route', () => {
        render(<Header user={{ name: 'mock username' }} />)
        fireEvent.click(screen.getByText('Create Recipes'))
        expect(routePushMock).toHaveBeenCalledWith('/CreateRecipe')
    })

    it('opens the profile menu and navigates to the profile page', async () => {
        render(<Header user={{ name: 'mock username' }} />)
        fireEvent.click(screen.getByRole('button', { name: 'Open user menu' }))
        fireEvent.click(await screen.findByText('Your Profile'))
        expect(routePushMock).toHaveBeenCalledWith('/Profile')
    })

    it('signs the user out when sign out is clicked', async () => {
        render(<Header user={{ name: 'mock username' }} />)
        fireEvent.click(screen.getByRole('button', { name: 'Open user menu' }))
        fireEvent.click(await screen.findByText('Sign out'))
        expect(signOut).toHaveBeenCalled()
    })

    it('contains a buy me a coffee link', () => {
        render(<Header user={{ name: 'mock username' }} />)
        const link = screen.getByRole('link', { name: /buy/i })
        expect(link).toHaveAttribute('href', 'https://www.buymeacoffee.com/dereje')
    })

})