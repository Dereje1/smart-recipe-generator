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
        const { container } = render(<RecipeDisplayModal recipe={stub_recipe_1} isOpen close={jest.fn()} />)
        await screen.findByText('Recipe_1_name')
        // expect(container).toMatchSnapshot() <-- todo: container and screen contents not matching... why ?
    })
    it('shall handle cloning ingredients', async () => {
        const { container } = render(<RecipeDisplayModal recipe={stub_recipe_1} isOpen close={jest.fn()} />)
        await screen.findByText('Recipe_1_name')
        fireEvent.click(screen.getByText('Clone Ingredients'));
        expect(routePushMock).toHaveBeenCalledWith({ "pathname": "/CreateRecipe", "query": { "oldIngredients": ["Recipe_1_Ingredient_1", "Recipe_1_Ingredient_2"] } })
    })
})