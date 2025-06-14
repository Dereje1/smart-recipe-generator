import ViewRecipes from "../../../src/components/Recipe_Display/ViewRecipes";
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as apiCalls from "../../../src/utils/utils";
import { stubRecipeBatch } from '../../stub'

const routePushMock = jest.fn()

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

jest.mock("../../../src/utils/utils")

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
        const popoverbutton = await screen.findAllByRole('button')
        fireEvent.click(popoverbutton[0])
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByText('user_1')).not.toBeInTheDocument();
    })

    it('shall send request to delete a recipe', async () => {
        const deleteApi = jest.spyOn(apiCalls, 'call_api');
        deleteApi.mockImplementationOnce(() => Promise.resolve({
            message: 'succesfully deleted',
            error: null
        }))
        render(
            <ViewRecipes recipes={stubRecipeBatch} handleRecipeListUpdate={jest.fn()} />
        )

        fireEvent.click(screen.getAllByText('See Recipe')[0]);
        await screen.findByText('user_1');
        // user1 is owner of recipe 1
        expect(screen.queryByText('user_1')).toBeInTheDocument();
        //open popover
        const popoverbutton = await screen.findAllByRole('button')
        fireEvent.click(popoverbutton[0])
        //open delete dialog
        const deleteDialogButton = await screen.findByText('Delete Recipe');
        fireEvent.click(deleteDialogButton)
        //click delete on dialog
        const deleteButton = await screen.findByText('Delete');
        fireEvent.click(deleteButton)
        expect(deleteApi).toHaveBeenCalledWith({
            "address": `/api/delete-recipe?recipeId=6683b8d38475eac9af5fe838`,
            "method": "delete"
        })
    })

    it('shall handle errors on request to delete a recipe', async () => {
        const deleteApi = jest.spyOn(apiCalls, 'call_api');
        deleteApi.mockImplementationOnce(() => Promise.resolve({
            message: null,
            error: 'an error'
        }))
        render(
            <ViewRecipes recipes={stubRecipeBatch} handleRecipeListUpdate={jest.fn()} />
        )

        fireEvent.click(screen.getAllByText('See Recipe')[0]);
        await screen.findByText('user_1');
        // user1 is owner of recipe 1
        expect(screen.queryByText('user_1')).toBeInTheDocument();
        //open popover
        const popoverbutton = await screen.findAllByRole('button')
        fireEvent.click(popoverbutton[0])
        //open delete dialog
        const deleteDialogButton = await screen.findByText('Delete Recipe');
        fireEvent.click(deleteDialogButton)
        //click delete on dialog
        const deleteButton = await screen.findByText('Delete');
        fireEvent.click(deleteButton)
        expect(deleteApi).toHaveBeenCalledWith({
            "address": `/api/delete-recipe?recipeId=6683b8d38475eac9af5fe838`,
            "method": "delete"
        })
    })
})