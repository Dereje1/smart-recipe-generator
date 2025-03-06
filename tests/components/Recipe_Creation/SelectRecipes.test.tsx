import SelectRecipesComponent from "../../../src/components/Recipe_Creation/SelectRecipes";
import { fireEvent, render, screen } from '@testing-library/react'
import { stubRecipeBatch } from "../../stub";

describe('The recipe selection component', () => {
    let props: any;
    beforeEach(() => {
        props = {
            generatedRecipes: stubRecipeBatch,
            updateSelectedRecipes: jest.fn(),
            selectedRecipes: []
        }
    })
    afterEach(() => {
        props.updateSelectedRecipes.mockClear()
    })
    it('shall handle a single recipe selection', () => {
        render(<SelectRecipesComponent {...props} />)
        // select first recipe in list
        const firstRecipe = screen.getAllByRole('switch')[0]
        fireEvent.click(firstRecipe);
        expect(props.updateSelectedRecipes).toHaveBeenCalledWith(["6683b8908475eac9af5fe834"])
    })

    it('shall handle a single recipe de-selection', () => {
        const updatedProps = {
            ...props,
            selectedRecipes: ["6683b8908475eac9af5fe834"]
        }
        render(<SelectRecipesComponent {...updatedProps} />)
        // select first recipe in list
        const firstRecipe = screen.getAllByRole('switch')[0]
        fireEvent.click(firstRecipe);
        expect(props.updateSelectedRecipes).toHaveBeenCalledWith([])
    })
})