import UserRecipeSelector from "../../../../src/components/Profile_Information/UserRecipeSelector";
import { render, screen, fireEvent } from '@testing-library/react'

describe('The Profile recipe view selector',()=>{
    it('renders', () => {
        const { container } = render(<UserRecipeSelector displaySetting="created" setDisplaySetting={()=>({})}/>)
        expect(container).toMatchSnapshot()
    })

    it('will switch to the created view', () => {
        const mockSetDisplaySetting = jest.fn();
        render(<UserRecipeSelector displaySetting="created" setDisplaySetting={mockSetDisplaySetting}/>)
        fireEvent.click(screen.getByText('Created'));
        expect(mockSetDisplaySetting).toHaveBeenCalledWith("created")
    })

    it('will switch to the favorites view', () => {
        const mockSetDisplaySetting = jest.fn();
        render(<UserRecipeSelector displaySetting="favorites" setDisplaySetting={mockSetDisplaySetting}/>)
        fireEvent.click(screen.getByText('Favorites'));
        expect(mockSetDisplaySetting).toHaveBeenCalledWith("favorites")
    })
})
