import RecipeDisplayModal from "../../../src/components/Recipe_Display/Dialog";
import { render, screen, fireEvent } from '@testing-library/react'
import * as apiCalls from "../../../src/utils/utils";
import { stub_recipe_1 } from '../../stub'

const routePushMock = jest.fn()

jest.mock("../../../src/utils/utils")

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        events: {
            on: jest.fn(),
            off: jest.fn()
        }
    })),
}))

describe('The Recipe display modal', () => {
    it('shall render', async () => {
        const { container } = render(
            <RecipeDisplayModal
                recipe={stub_recipe_1}
                isOpen
                close={jest.fn()}
                removeRecipe={jest.fn()}
                handleRecipeListUpdate={jest.fn()}
            />)
        await screen.findByText('Recipe_1_name')
        // expect(container).toMatchSnapshot() <-- todo: container and screen contents not matching... why ?
    })
    it('shall handle cloning ingredients', async () => {
        const { container } = render(
            <RecipeDisplayModal
                recipe={stub_recipe_1}
                isOpen
                close={jest.fn()}
                removeRecipe={jest.fn()}
                handleRecipeListUpdate={jest.fn()}
            />)
        await screen.findByText('Recipe_1_name')
        const popoverbutton = await screen.findAllByRole('button')
        fireEvent.click(popoverbutton[0])
        fireEvent.click(screen.getByText('Clone Ingredients'));
        expect(routePushMock).toHaveBeenCalledWith({ "pathname": "/CreateRecipe", "query": { "oldIngredients": ["Recipe_1_Ingredient_1", "Recipe_1_Ingredient_2"] } })
    })

    it('shall open the delete dialog', async () => {
        const deleteRecipeMock = jest.fn()
        const { container } = render(
            <RecipeDisplayModal
                recipe={stub_recipe_1}
                isOpen
                close={jest.fn()}
                removeRecipe={jest.fn()}
                handleRecipeListUpdate={jest.fn()}
            />)
        await screen.findByText('Recipe_1_name')
        const popoverbutton = await screen.findAllByRole('button')
        fireEvent.click(popoverbutton[0])
        fireEvent.click(screen.getByText('Delete Recipe'));
        const deleteDialog = await screen.findByText('Permanently delete Recipe_1_name ?')
        expect(deleteDialog).toBeInTheDocument()
    })

    it('shall cancel the delete recipe dialog', async () => {
        const deleteRecipeMock = jest.fn()
        const { container } = render(
            <RecipeDisplayModal
                recipe={stub_recipe_1}
                isOpen
                close={jest.fn()}
                removeRecipe={jest.fn()}
                handleRecipeListUpdate={jest.fn()}
            />)
        await screen.findByText('Recipe_1_name')
        const popoverbutton = await screen.findAllByRole('button')
        fireEvent.click(popoverbutton[0])
        fireEvent.click(screen.getByText('Delete Recipe'));
        const cancelbutton = await screen.findByText('Cancel')
        fireEvent.click(cancelbutton)
        expect(deleteRecipeMock).not.toHaveBeenCalled()
        expect(screen.queryByText('Permanently delete Recipe_1_name ?')).not.toBeInTheDocument();
    })

    it('shall delete a recipe', async () => {
        const deleteRecipe = jest.spyOn(apiCalls, 'call_api');
        deleteRecipe.mockImplementationOnce(() => Promise.resolve({ message: 'succesfully deleted', error: null }))
        const removeRecipeMock = jest.fn()
        const { container } = render(
            <RecipeDisplayModal
                recipe={stub_recipe_1}
                isOpen close={jest.fn()}
                removeRecipe={removeRecipeMock}
                handleRecipeListUpdate={jest.fn()}
            />)
        await screen.findByText('Recipe_1_name')
        const popoverbutton = await screen.findAllByRole('button')
        fireEvent.click(popoverbutton[0])
        fireEvent.click(screen.getByText('Delete Recipe'));
        const deletebutton = await screen.findByText('Delete')
        fireEvent.click(deletebutton)
        // wait for api call to resolve
        await screen.findByRole('button')
        expect(removeRecipeMock).toHaveBeenCalledWith({ message: 'succesfully deleted', error: null })
        expect(screen.queryByText('Permanently delete Recipe_1_name ?')).not.toBeInTheDocument();
    })
})