import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import Layout from "../../src/components/Layout";

jest.mock("next-auth/react",()=>({
    ...jest.requireActual("next-auth/react"),
    useSession: jest.fn(() => ({
        data: null,
        status: 'authenticated'
    }))
}))

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        query: {},
        pathname:''
    })),
}))

jest.mock("../../src/components/Header")

describe('The Layout', () => {
    it('renders the Error page for a sign in error', () => {
        (useRouter as jest.Mock).mockImplementationOnce(() => ({
            query: {
                error: 'a sign in error'
            }
        })).mockImplementationOnce(() => ({
            query: {
                error: 'a sign in error'
            }
        }))
        const { container } = render(
            <Layout><div>Child component</div>
            </Layout>)
        expect(screen.getByText('Sign In Error')).toBeInTheDocument();
        expect(screen.getByText('An unexpected error: "a sign in error" occurred. Please try again later.')).toBeInTheDocument();
    })

    it('renders the Error a page not found', () => {
        (useRouter as jest.Mock).mockImplementationOnce(() => ({
            query:{},
            pathname: '/_error'
        }))
        const { container } = render(
            <Layout><div>Child component</div>
            </Layout>)
        expect(screen.getByText('Page not found')).toBeInTheDocument();
    })

    it('renders the Loading wheel if session is loading', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: null,
            status: "loading"
        }))
        const { container } = render(
            <Layout>
                <div>Child component</div>
            </Layout>)
        expect(container).toMatchSnapshot()
    })
    it('renders the hero if the user is not authenticated', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: null,
            status: "unauthenticated",
        }))
        const { container } = render(
            <Layout><div>Child component</div>
            </Layout>)
        expect(container).toMatchSnapshot()
        expect(screen.getByText('Get started')).toBeInTheDocument();
    })
    it('renders the the children if session is valid', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: {
                user: {
                    name: "mockuser",
                    image: "mockImage",
                    email: "mockEmail"
                },
            },
            status: "authenticated",
        }))
        const { container } = render(
            <Layout>
                <div>Child component</div>
            </Layout>)
        expect(screen.getByText('Child component')).toBeInTheDocument();
    })
})