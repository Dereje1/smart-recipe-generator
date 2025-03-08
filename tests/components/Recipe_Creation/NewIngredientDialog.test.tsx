import NewIngredientDialog from "../../../src/components/Recipe_Creation/NewIngredientDialog";
import * as apiCalls from "../../../src/utils/utils";
import { fireEvent, render, screen } from '@testing-library/react'

jest.mock("../../../src/utils/utils");

describe('The new Ingredient Dialog', () => {
    let props: any;
    beforeEach(() => {
        props = {
            ingredientList: [{ _id: '1', name: 'ingredient-1' }, { _id: '2', name: 'ingredient-2' }],
            updateIngredientList: jest.fn()
        }
    })
    it('will handle input changes', async () => {
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        const input = await screen.findByLabelText('Ingredient Name')
        fireEvent.change(input, { target: { value: 'test-ingredient' } })
        expect(input.getAttribute('value')).toBe('test-ingredient')
    })

    it('will reject long ingredient names', async () => {
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        const input = await screen.findByLabelText('Ingredient Name')
        fireEvent.change(input, { target: { value: 'Very long ingredient name' } })
        const submitButton = await screen.findByText('Submit')
        fireEvent.click(submitButton);
        const message = await screen.findByText('This ingredient name is too long!')
        expect(message).toBeInTheDocument();
    })

    it('will reject already existing ingredient names', async () => {
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        const input = await screen.findByLabelText('Ingredient Name')
        fireEvent.change(input, { target: { value: 'ingredient-1' } })
        const submitButton = await screen.findByText('Submit')
        fireEvent.click(submitButton);
        const message = await screen.findByText('This ingredient is already available')
        expect(message).toBeInTheDocument();
    })

    it('will submit recipe to api and successfully add to the db', async () => {
        const addIngredient = jest.spyOn(apiCalls, 'call_api');
        addIngredient.mockImplementationOnce(() => Promise.resolve({
            message: 'Success',
            newIngredient: {
                name: 'ingredient-3',
            },
            suggested: ['ingredient-A', 'ingredient-B', 'ingredient-C']
        }))
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        const input = await screen.findByLabelText('Ingredient Name')
        fireEvent.change(input, { target: { value: 'ingredient-3' } })
        const submitButton = await screen.findByText('Submit')
        fireEvent.click(submitButton);
        const message = await screen.findByText(/^Successfully added: ingredient-3/)
        expect(message).toBeInTheDocument();
        expect(addIngredient).toHaveBeenCalledWith({
            "address": "/api/validate-ingredient", 
            "method": "post", 
            "payload": {"ingredientName": "ingredient-3"}
        })
    })


    it('will submit recipe to api and process invalid ingredients', async () => {
        const addIngredient = jest.spyOn(apiCalls, 'call_api');
        addIngredient.mockImplementationOnce(() => Promise.resolve({
            message: 'Invalid',
            suggested: ['ingredient-A', 'ingredient-B', 'ingredient-C']
        }))
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        const input = await screen.findByLabelText('Ingredient Name')
        fireEvent.change(input, { target: { value: 'ingredient-3' } })
        const submitButton = await screen.findByText('Submit')
        fireEvent.click(submitButton);
        const message = await screen.findByText('ingredient-3 is invalid. Try the following suggestions: ingredient-A, ingredient-B, ingredient-C')
        expect(message).toBeInTheDocument();
        expect(addIngredient).toHaveBeenCalledWith({
            "address": "/api/validate-ingredient", 
            "method": "post", 
            "payload": {"ingredientName": "ingredient-3"}
        })
    })

    it('will submit recipe to api and process validation errors from the api', async () => {
        const addIngredient = jest.spyOn(apiCalls, 'call_api');
        addIngredient.mockImplementationOnce(() => Promise.resolve({
            message: 'erroneous response',
        }))
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        const input = await screen.findByLabelText('Ingredient Name')
        fireEvent.change(input, { target: { value: 'ingredient-3' } })
        const submitButton = await screen.findByText('Submit')
        fireEvent.click(submitButton);
        const message = await screen.findByText('An error occurred with validation... check back later: erroneous response')
        expect(message).toBeInTheDocument();
        expect(addIngredient).toHaveBeenCalledWith({
            "address": "/api/validate-ingredient", 
            "method": "post", 
            "payload": {"ingredientName": "ingredient-3"}
        })
    })

    it('will handle rejected api calls', async () => {
        const addIngredient = jest.spyOn(apiCalls, 'call_api');
        addIngredient.mockImplementationOnce(() => (Promise.reject()))
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        const input = await screen.findByLabelText('Ingredient Name')
        fireEvent.change(input, { target: { value: 'ingredient-3' } })
        const submitButton = await screen.findByText('Submit')
        fireEvent.click(submitButton);
        const message = await screen.findByText('Failed to add ingredient')
        expect(message).toBeInTheDocument();
        expect(addIngredient).toHaveBeenCalledWith({
            "address": "/api/validate-ingredient", 
            "method": "post", 
            "payload": {"ingredientName": "ingredient-3"}
        })
    })

    it('will close the dialog', async () => {
        render(<NewIngredientDialog {...props} />)
        const openButton = await screen.findByText('Add New Ingredient')
        fireEvent.click(openButton)
        let message: any = await screen.findByText('If you can\'t find your ingredient in the list, enter its name here. We\'ll validate it before adding to the database.')
        expect(message).toBeInTheDocument();
        const closeButton = await screen.findByText('Cancel')
        fireEvent.click(closeButton)
        message = await screen.queryByText('If you can\'t find your ingredient in the list, enter its name here. We\'ll validate it before adding to the database.')
        expect(message).toBeNull();
    })
})