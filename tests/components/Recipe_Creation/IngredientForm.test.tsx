import IngredientForm from "../../../src/components/Recipe_Creation/IngredientForm";
import { fireEvent, render, screen } from '@testing-library/react'

describe('The ingredient input component', () => {
    let props: any;
    beforeEach(() => {
        props = {
            ingredientList: [{ _id: '1', name: 'Ingredient-1' }, { _id: '2', name: 'Ingredient-2' }],
            ingredients: [{ id: "1", name: "added-ingredient-1" }, { id: "2", name: "added-ingredient-2" }],
            updateIngredients: jest.fn(),
            generatedRecipes: []
        }
    })
    it('Will delete selected ingredients', () => {
        render(<IngredientForm {...props} />)
        // get all buttons in the ingredient form
        const allButtons = screen.getAllByRole('button')
        // Fire second button (added-Ingredient-1 chip)
        fireEvent.click(allButtons[2]);
        expect(props.updateIngredients).toHaveBeenLastCalledWith([props.ingredients[1]])
    })

    it('Will open the modal to add a new ingredient to the list', async () => {
        render(<IngredientForm {...props} />)
        const addIngredient = screen.getByText('Add New Ingredient')
        // make sure modal is not there
        let message: any = await screen.queryByText((
            'If you can\'t find your ingredient in the list, enter its name here. We\'ll validate it before adding to the database.'
        ))
        expect(message).toBeNull()
        // open modal
        fireEvent.click(addIngredient);
        message = await screen.findByText((
            'If you can\'t find your ingredient in the list, enter its name here. We\'ll validate it before adding to the database.'
        ))
        expect(message).toBeInTheDocument()
    })
})