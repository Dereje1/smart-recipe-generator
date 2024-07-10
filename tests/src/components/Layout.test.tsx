import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useSession } from "next-auth/react"
import Layout from "../../../src/components/Layout";

jest.mock("next-auth/react")
jest.mock("../../../src/components/Header")

describe('The Layout', () => {
    it('renders the hero if there is no session', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => ({
            data: null,
        }))
        const { container } = render(
            <Layout><div>Child component</div>
            </Layout>)
        expect(container).toMatchSnapshot()
        expect(screen.getByText('Get started')).toBeInTheDocument();
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