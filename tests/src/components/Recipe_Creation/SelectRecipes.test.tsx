import SelectRecipesComponent from "../../../../src/components/Recipe_Creation/SelectRecipes";
import { fireEvent, render, screen } from '@testing-library/react'
import { stubRecipeBatch } from "../../../stub";

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

    it('shall handle selecting all recipes', () => {
        render(<SelectRecipesComponent {...props} />)
        const selectAllButton = screen.getByText('Select All')
        fireEvent.click(selectAllButton);
        expect(props.updateSelectedRecipes).toHaveBeenCalledWith(["6683b8908475eac9af5fe834", "6683b8908475eac9af5fe836"])
    })

    it('shall handle de-selecting all recipes', () => {
        const updatedProps = {
            ...props,
            selectedRecipes: ["6683b8908475eac9af5fe834", "6683b8908475eac9af5fe836"]
        }
        render(<SelectRecipesComponent {...props} />)
        const selectAllButton = screen.getByText('Unselect All')
        fireEvent.click(selectAllButton);
        expect(props.updateSelectedRecipes).toHaveBeenCalledWith([])
    })
})