import RecipeDisplayModal from "../../../../src/components/Recipe_Display/Dialog";
import { render, screen, fireEvent } from '@testing-library/react'
import { stub_recipe_1 } from '../../../stub'

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

describe('The Recipe display modal', () => {
    it('shall render', async () => {
        const { container } = render(<RecipeDisplayModal recipe={stub_recipe_1} isOpen close={jest.fn()} deleteRecipe={jest.fn()}/>)
        await screen.findByText('Recipe_1_name')
        // expect(container).toMatchSnapshot() <-- todo: container and screen contents not matching... why ?
    })
    it('shall handle cloning ingredients', async () => {
        const { container } = render(<RecipeDisplayModal recipe={stub_recipe_1} isOpen close={jest.fn()} deleteRecipe={jest.fn()}/>)
        await screen.findByText('Recipe_1_name')
        fireEvent.click(screen.getByText('Clone Ingredients'));
        expect(routePushMock).toHaveBeenCalledWith({ "pathname": "/CreateRecipe", "query": { "oldIngredients": ["Recipe_1_Ingredient_1", "Recipe_1_Ingredient_2"] } })
    })

    it('shall open the delete dialog', async () => {
        const deleteRecipeMock = jest.fn()
        const { container } = render(<RecipeDisplayModal recipe={stub_recipe_1} isOpen close={jest.fn()} deleteRecipe={deleteRecipeMock}/>)
        await screen.findByText('Recipe_1_name')
        fireEvent.click(screen.getByText('Delete Recipe'));
        const deleteDialog = await screen.findByText('Permanently delete Recipe_1_name ?')
        expect(deleteDialog).toBeInTheDocument()
    })

    it('shall cancel the delete recipe dialog', async () => {
        const deleteRecipeMock = jest.fn()
        const { container } = render(<RecipeDisplayModal recipe={stub_recipe_1} isOpen close={jest.fn()} deleteRecipe={deleteRecipeMock}/>)
        await screen.findByText('Recipe_1_name')
        fireEvent.click(screen.getByText('Delete Recipe'));
        const cancelbutton = await screen.findByText('Cancel')
        fireEvent.click(cancelbutton)
        expect(deleteRecipeMock).not.toHaveBeenCalled()
        expect(screen.queryByText('Permanently delete Recipe_1_name ?')).not.toBeInTheDocument();
    })

    it('shall delete a recipe', async () => {
        const deleteRecipeMock = jest.fn()
        const { container } = render(<RecipeDisplayModal recipe={stub_recipe_1} isOpen close={jest.fn()} deleteRecipe={deleteRecipeMock}/>)
        await screen.findByText('Recipe_1_name')
        fireEvent.click(screen.getByText('Delete Recipe'));
        const deletebutton = await screen.findByText('Delete')
        fireEvent.click(deletebutton)
        expect(deleteRecipeMock).toHaveBeenCalled()
        expect(screen.queryByText('Permanently delete Recipe_1_name ?')).not.toBeInTheDocument();
    })
})