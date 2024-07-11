import ViewRecipes from "../../../../src/components/Recipe_Display/ViewRecipes";
import { render, screen, fireEvent } from '@testing-library/react'
import { stubRecipeBatch } from '../../../stub'

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

describe('The view recipes component', () => {
    it('shall render all available recipes', () => {
        render(
            <ViewRecipes recipes={stubRecipeBatch} handleRecipeListUpdate={jest.fn()} />
        )
        expect(screen.getByText('Recipe_1_name')).toBeInTheDocument();
        expect(screen.getByText('Recipe_1_nutritionalInformation')).toBeInTheDocument();
        expect(screen.getByText('Recipe_2_name')).toBeInTheDocument();
        expect(screen.getByText('Recipe_2_nutritionalInformation')).toBeInTheDocument();
    })
    it('shall not render anything if no recipes given', () => {
        const { container } = render(
            <ViewRecipes recipes={[]} handleRecipeListUpdate={jest.fn()} />
        )
        expect(container.firstChild).toBeNull();
    })
    it('shall set state and open the dialog for a recipe', async () => {
        render(
            <ViewRecipes recipes={stubRecipeBatch} handleRecipeListUpdate={jest.fn()} />
        )

        fireEvent.click(screen.getAllByText('See Recipe')[0]);
        await screen.findByText('user_1');
        // user1 is owner of recipe 1
        expect(screen.queryByText('user_1')).toBeInTheDocument();
        expect(screen.queryByText('user_2')).not.toBeInTheDocument();
    })
    it('shall close the open dialog', async () => {
        render(
            <ViewRecipes recipes={stubRecipeBatch} handleRecipeListUpdate={jest.fn()} />
        )
        // open the dialog first
        fireEvent.click(screen.getAllByText('See Recipe')[0]);
        await screen.findByText('user_1');
        expect(screen.queryByText('user_1')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId("open_recipe_dialog"));
        await screen.findByText('Recipe_1_name');
        expect(screen.queryByText('user_1')).not.toBeInTheDocument();
    })
})