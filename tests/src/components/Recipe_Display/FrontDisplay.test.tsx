import FrontDisplay from "../../../../src/components/Recipe_Display/FrontDisplay";
import { render, screen, fireEvent } from '@testing-library/react'
import { likeRecipe } from "../../../../src/components/Recipe_Display/call_api";
import { stub_recipe_1 } from "../../../stub";

jest.mock("../../../../src/components/Recipe_Display/call_api")

describe('The single front facing display', () => {
    let updatedRecipe: any;
    const updateRecipeListMock= jest.fn();
    beforeEach(() => {
        updatedRecipe = {
            ...stub_recipe_1,
            owns: false,
            liked: false
        }
    })
    it('shall render', () => {
        const { container } = render(<FrontDisplay recipe={updatedRecipe} showRecipe={jest.fn()} updateRecipeList={jest.fn()} isLoading={false} />)
        expect(container).toMatchSnapshot()
    })

    it('shall render for a loading recipe', () => {
        const { container } = render(<FrontDisplay recipe={updatedRecipe} showRecipe={jest.fn()} updateRecipeList={jest.fn()} isLoading={true} />)
        expect(container).toMatchSnapshot()
    })

    it('shall handle "Liking" a recipe', async () => {
        (likeRecipe as jest.Mock).mockImplementationOnce(() => ({
            ...updatedRecipe,
            liked: true
        }))
        const { container } = render(<FrontDisplay recipe={updatedRecipe} showRecipe={jest.fn()} updateRecipeList={updateRecipeListMock} isLoading={false} />)
        fireEvent.click(screen.getByTestId('like_button'));
        await screen.findByText('Recipe_1_name')
        expect(updateRecipeListMock).toHaveBeenCalledWith({...updatedRecipe, liked: true})
    })

})