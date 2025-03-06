import FrontDisplay from "../../../src/components/Recipe_Display/FrontDisplay";
import { render, screen, fireEvent } from '@testing-library/react'
import * as apiCalls from "../../../src/utils/utils";
import { stub_recipe_1 } from "../../stub";

jest.mock("../../../src/utils/utils")

describe('The single front facing display', () => {
    let updatedRecipe: any;
    const updateRecipeListMock = jest.fn();
    beforeEach(() => {
        updatedRecipe = {
            ...stub_recipe_1,
            owns: false,
            liked: false
        }
    })
    it('shall render', () => {
        const { container } = render(<FrontDisplay recipe={updatedRecipe} showRecipe={jest.fn()} updateRecipeList={jest.fn()} />)
        expect(container).toMatchSnapshot()
    })

    it('shall render for a loading recipe', () => {
        const { container } = render(<FrontDisplay recipe={updatedRecipe} showRecipe={jest.fn()} updateRecipeList={jest.fn()} />)
        expect(container).toMatchSnapshot()
    })

    it('shall handle "Liking" a recipe', async () => {
        const likeRecipe = jest.spyOn(apiCalls, 'call_api');
        likeRecipe.mockImplementationOnce(() => Promise.resolve({
            ...updatedRecipe,
            liked: true
        }))
        const { container } = render(<FrontDisplay recipe={updatedRecipe} showRecipe={jest.fn()} updateRecipeList={updateRecipeListMock} />)
        fireEvent.click(screen.getByTestId('like_button'));
        await screen.findByText('Recipe_1_name')
        expect(updateRecipeListMock).toHaveBeenCalledWith({ ...updatedRecipe, liked: true })
        expect(likeRecipe).toHaveBeenCalledWith({
            "address": "/api/like-recipe",
            "method": "put",
            "payload": { "recipeId": "6683b8d38475eac9af5fe838" }
        })
    })

})