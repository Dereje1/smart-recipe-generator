import StepComponent from "../../../src/components/Recipe_Creation/StepComponent";
import { render, screen } from '@testing-library/react'
import { stubRecipeBatch } from "../../stub";

describe('The step component', () => {
    let stepComponentProps: any;
    beforeEach(() => {
        stepComponentProps = {
            step: 0,
            ingredientList: ["Mock_Ingredient_List_1", "Mock_Ingredient_List_2"],
            ingredients: ["Mock_Ingredient_1", "Mock_Ingredient_2"],
            updateIngredients: jest.fn(),
            preferences: ["preference-1", "preference-2"],
            updatePreferences: jest.fn(),
            editInputs: jest.fn(),
            handleIngredientSubmit: jest.fn(),
            generatedRecipes: stubRecipeBatch
        }
    })
    it('shall render the ingredient selection form', () => {
        const { container } = render(<StepComponent {...stepComponentProps} />)
        expect(container).toMatchSnapshot()
        expect(screen.getByText('Selected Ingredients:')).toBeInTheDocument();
    })
    it('shall render the diet preference selection', () => {
        const updatedProps = { ...stepComponentProps, step: 1 }
        const { container } = render(<StepComponent {...updatedProps} />)
        expect(container).toMatchSnapshot()
        expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    })

    it('shall render the review inputs section', () => {
        const updatedProps = { ...stepComponentProps, step: 2 }
        const { container } = render(<StepComponent {...updatedProps} />)
        expect(container).toMatchSnapshot()
        expect(screen.getByText('Submit Your Recipe Choices')).toBeInTheDocument();
        expect(screen.getByText(/Use the switch on each recipe generated to select the recipes you want to submit./)).toBeInTheDocument();
    })

    it('shall render a message for a non-existing step', () => {
        const updatedProps = { ...stepComponentProps, step: 4 }
        render(<StepComponent {...updatedProps} />)
        expect(screen.getByText('Coming Soon!')).toBeInTheDocument();
    })
})