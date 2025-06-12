import { useSession } from "next-auth/react"
import Hero from "../../src/pages/Hero";
import { fireEvent, render, screen } from '@testing-library/react'


const mockSignin = jest.fn()
jest.mock("next-auth/react",()=>({
    ...jest.requireActual("next-auth/react"),
    signIn: () => mockSignin(),
    useSession: jest.fn(() => ({
        data: null,
        status: 'authenticated'
    })),
    getSession: jest.fn(()=> Promise.resolve())
}))

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        query: {}
    })),
}))

describe("The Hero Component",()=>{
    it('shall reset the product page', async ()=>{
        render(<Hero/>)
        const product = await screen.findByText('Product')
        fireEvent.click(product);
        let productComponent: any = await screen.findByText('Our Product')
        expect(productComponent).toBeInTheDocument();
        const backHomeButton = await screen.findByText('Back to Home')
        fireEvent.click(backHomeButton);
        productComponent = await await screen.queryByText('Our Product')
        expect(productComponent).toBeNull()
    })

    it('shall reset the features page', async ()=>{
        render(<Hero/>)
        const feature = await screen.findByText('Features')
        fireEvent.click(feature);
        let featureComponent: any = await screen.findByText('Explore what makes Smart Recipe Generator unique.')
        expect(featureComponent).toBeInTheDocument();
        const backHomeButton = await screen.findByText('Back to Home')
        fireEvent.click(backHomeButton);
        featureComponent = await screen.queryByText('Explore what makes Smart Recipe Generator unique.')
        expect(featureComponent).toBeNull()
    })

    it('shall open the external link for the about page', async ()=>{
        global.open = jest.fn();
        render(<Hero/>)
        const about = await screen.findByText('About')
        fireEvent.click(about)
        expect(global.open).toHaveBeenCalledWith("https://github.com/Dereje1/smart-recipe-generator", "_blank")
    })

    it('will sign the user in with both buttons', async ()=>{
        render(<Hero />)
        const signIn_a = await screen.findByText('Log in With Google')
        fireEvent.click(signIn_a)
        await screen.getByText('About')
        const signIn_b = await screen.findByText('Get started')
        fireEvent.click(signIn_b)
        expect(mockSignin).toHaveBeenCalledTimes(2)
    })

    it('shall render the Error page if the user is already logged in', async ()=>{
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: 'user is logged in',
        }))
        render(<Hero/>)
        const errorPage = await screen.findByText('Inaccessible Page')
        expect(errorPage).toBeInTheDocument();
    })
})