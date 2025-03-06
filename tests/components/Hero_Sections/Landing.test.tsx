import { signIn } from "next-auth/react";
import Landing from "../../../src/components/Hero_Sections/Landing";
import { render, screen, fireEvent } from '@testing-library/react'


jest.mock("next-auth/react")

it('The Landing section renders', () => {
    const { container } = render(<Landing />)
    expect(container).toMatchSnapshot()
})

it('Shall be the user to sign in', () => {
    const mockSignIn = jest.fn();
    (signIn as jest.Mock).mockImplementationOnce(mockSignIn);
    const { container } = render(<Landing />)
    fireEvent.click(screen.getByText('Get started'));
    expect(mockSignIn).toHaveBeenCalledTimes(1)
})