import DietaryPreferences from "../../../src/components/Recipe_Creation/DietaryPreferences";
import { fireEvent, render, screen } from '@testing-library/react'

describe('The dietary preference selection', () => {
    let props: any;
    beforeEach(() => {
        props = {
            preferences: [],
            updatePreferences: jest.fn(),
            generatedRecipes: []
        }
    })
    afterEach(() => {
        props.updatePreferences.mockClear()
    })
    it('shall handle selection/s', async () => {
        render(<DietaryPreferences {...props}/>)
        const preferences = screen.getAllByRole('checkbox')
        // first uncheck no prefrences and assert
        fireEvent.click(preferences[0]);
        await screen.findByText('Dietary Preferences')
        expect(props.updatePreferences).toHaveBeenLastCalledWith([])

        fireEvent.click(preferences[2]);
        await screen.findByText('Dietary Preferences')
        expect(props.updatePreferences).toHaveBeenLastCalledWith(["Vegan"])

        fireEvent.click(preferences[4]);
        await screen.findByText('Dietary Preferences')
        expect(props.updatePreferences).toHaveBeenLastCalledWith(["Dairy-Free"])
    })

    it('shall handle de-selection/s', async () => {
        const updatedProps = {
            ...props,
            preferences: ["Vegan", "Dairy-Free"]
        }
        render(<DietaryPreferences {...updatedProps}/>)
        const preferences = screen.getAllByRole('checkbox')
        //select keto again
        fireEvent.click(preferences[4]);
        await screen.findByText('Dietary Preferences')
        expect(props.updatePreferences).toHaveBeenLastCalledWith(["Vegan"])
    })
})