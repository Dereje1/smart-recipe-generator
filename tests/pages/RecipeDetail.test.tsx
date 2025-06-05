import RecipeDetail from "../../src/pages/RecipeDetail";
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/router';
import * as apiCalls from "../../src/utils/utils";
import { stub_recipe_1 } from '../stub'
import * as useRecipeHook from "../../src/components/Hooks/useRecipeData"

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        query: {
            recipeId: 'stub_recipeid'
        },
        events:{
            on: jest.fn(),
            off: jest.fn()
        }
    })),
}))

jest.mock("next/image")

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    call_api: jest.fn()
}))

jest.mock("../../src/components/Hooks/useRecipeData", () => ({
    ...jest.requireActual("../../src/components/Hooks/useRecipeData"),
    useRecipeData: jest.fn()
}))

let actionPopoverArgs: any[] = []
const mockActionPopover = jest.fn((...args: any[]) => {
    actionPopoverArgs = args;
    return {
        handleClone: jest.fn(),
        handleCopy: jest.fn(),
        handlePlayRecipe: jest.fn(),
        handleDeleteDialog: jest.fn(),
        handleDeleteRecipe: jest.fn(),
        linkCopied: false,
        isPlayingAudio: false,
        isLoadingAudio: false,
        isDeleteDialogOpen: false,
    }
});
jest.mock("../../src/components/Hooks/useActionPopover", () => ({
    __esModule: true,
    default: (...args: any[]) => mockActionPopover(...args)
}))

let receivedHandlers: any
const ActionPopoverMock = jest.fn((props) => {
    receivedHandlers = props.handlers
    return <button data-testid="delete-btn" onClick={props.handlers.deleteRecipe}>delete</button>
})
jest.mock("../../src/components/Recipe_Display/ActionPopover", () => ({
    __esModule: true,
    ActionPopover: (props: any) => ActionPopoverMock(props)
}))

const actualUseRecipeData = jest.requireActual("../../src/components/Hooks/useRecipeData");
const actualActionPopover = jest.requireActual("../../src/components/Recipe_Display/ActionPopover");

describe('The Recipe Detail Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRecipeHook.useRecipeData as jest.Mock).mockImplementation(actualUseRecipeData.useRecipeData)
        actionPopoverArgs = []
        ActionPopoverMock.mockImplementation((props) => {
            receivedHandlers = props.handlers
            return actualActionPopover.ActionPopover(props)
        })
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('shall succesfully render a recipe', async () => {
        //mock api call
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.resolve(stub_recipe_1))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('Recipe_1_name')).toBeInTheDocument()
        expect(container).toMatchSnapshot()
    })
    it('shall render the error page if no recipe id', async () => {
        //mock query route
        (useRouter as jest.Mock).mockImplementationOnce(() => ({
            query: {}
        }))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('Invalid Recipe')).toBeInTheDocument()
    })
    it('shall render the error page if there is a problem with fetching data', async () => {
         //mock api call
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.reject({message: 'Fetch error message'}))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('Fetch error message')).toBeInTheDocument()
    })

    it('shall render the error page if no data is returned', async () => {
         //mock api call
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.resolve(undefined))
        const { container } = render(
            <RecipeDetail />
        )
        expect(await screen.findByText('No Recipe Data')).toBeInTheDocument()
    })

    it('shall disable the like button for owned recipes', async () => {
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockResolvedValueOnce(stub_recipe_1)
        render(<RecipeDetail />)
        const likeButton = await screen.findByTestId('like_button')
        expect(likeButton).toBeDisabled()
    })

    it('shall handle liking a recipe', async () => {
        const notOwned = { ...stub_recipe_1, owns: false, liked: false }
        const updated = { ...notOwned, liked: true }
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api')
        getRecipeFromAPI
            .mockResolvedValueOnce(notOwned)
            .mockResolvedValueOnce(updated)
        render(<RecipeDetail />)
        const likeButton = await screen.findByTestId('like_button')
        expect(likeButton).not.toBeDisabled()
        fireEvent.click(likeButton)
        await screen.findByText('Recipe_1_name')
        expect(getRecipeFromAPI).toHaveBeenLastCalledWith({
            address: '/api/like-recipe',
            method: 'put',
            payload: { recipeId: notOwned._id }
        })
        const updatedButton = await screen.findByTestId('like_button')
        expect(updatedButton.querySelector('svg')?.getAttribute('fill')).toBe('currentColor')
    })

    it('shall update the recipe audio via updateRecipe', async () => {
        const setRecipeData = jest.fn()
        ;(useRecipeHook.useRecipeData as jest.Mock).mockReturnValue({
            recipeData: { ...stub_recipe_1 },
            loading: false,
            error: null,
            setRecipeData,
            setLoading: jest.fn()
        })
        render(<RecipeDetail />)
        expect(actionPopoverArgs.length).toBe(2)
        const updateFn = actionPopoverArgs[1]
        updateFn('new-audio')
        expect(setRecipeData).toHaveBeenCalled()
        const updater = setRecipeData.mock.calls[0][0]
        const newState = updater(stub_recipe_1)
        expect(newState.audio).toBe('new-audio')
    })

    it('shall delete recipe and redirect home', async () => {
        const setLoading = jest.fn()
        const handleDeleteRecipe = jest.fn().mockResolvedValue({ message: 'ok', error: '' })
        ;(useRecipeHook.useRecipeData as jest.Mock).mockReturnValue({
            recipeData: { ...stub_recipe_1 },
            loading: false,
            error: null,
            setRecipeData: jest.fn(),
            setLoading
        });
        (mockActionPopover as jest.Mock).mockImplementation((_, update) => {
            actionPopoverArgs = [_, update]
            return {
                handleClone: jest.fn(),
                handleCopy: jest.fn(),
                handlePlayRecipe: jest.fn(),
                handleDeleteDialog: jest.fn(),
                handleDeleteRecipe,
                linkCopied: false,
                isPlayingAudio: false,
                isLoadingAudio: false,
                isDeleteDialogOpen: false,
            }
        })
        render(<RecipeDetail />)
        await receivedHandlers.deleteRecipe()
        expect(setLoading).toHaveBeenCalledWith(true)
        expect(handleDeleteRecipe).toHaveBeenCalled()
        expect(routePushMock).toHaveBeenCalledWith('/')
    })
})
