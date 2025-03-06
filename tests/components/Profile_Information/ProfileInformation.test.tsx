import ProfileInformation from "../../../src/components/Profile_Information/ProfileInformation"
import { useSession } from "next-auth/react"
import { render, screen, fireEvent } from '@testing-library/react'

jest.mock("next-auth/react")

describe('The profile page', () => {
    it('shall render', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return {
                data: {
                    user: {
                        name: "mockuser",
                        image: "https://www.mockimage",
                        email: "mockEmail"
                    },
                }, status: 'authenticated'
            };
        });
        const {container} = render(<ProfileInformation recipes={[]} updateSelection={jest.fn()} selectedDisplay="created"  AIusage={40} />)
        
        expect(screen.getByText('mockuser')).toBeInTheDocument();
        expect(screen.getByText('mockEmail')).toBeInTheDocument();
        expect(screen.getByText('Recipes Created')).toBeInTheDocument();
        expect(screen.getByText('Votes Received')).toBeInTheDocument();
        expect(screen.getByText('Favorites')).toBeInTheDocument();
        expect(container.querySelector('img')?.src.includes('www.mockimage')).toBeTruthy();
    })
    it('shall use fall back profile image if no image field', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return {
                data: {
                    user: {
                        name: "mockuser",
                        email: "mockEmail"
                    },
                }, status: 'authenticated'
            };
        });
        const {container} = render(<ProfileInformation recipes={[]} updateSelection={jest.fn()} selectedDisplay="created" AIusage={40}/>)
        expect(container.querySelector('img')?.src.includes('www.gravatar')).toBeTruthy();
    })
    it('shall not render if no session', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return {
                data: null, status: 'loading'
            };
        });
        const { container } = render(<ProfileInformation recipes={[]} updateSelection={jest.fn()} selectedDisplay="created" AIusage={40}/>)
        expect(container.firstChild).toBeNull();
    })

    it('shall not render if no user', () => {
        (useSession as jest.Mock).mockImplementationOnce(() => {
            return {
                data: {}, status: 'loading'
            };
        });
        const { container } = render(<ProfileInformation recipes={[]} updateSelection={jest.fn()} selectedDisplay="created" AIusage={40}/>)
        expect(container.firstChild).toBeNull();
    })
})