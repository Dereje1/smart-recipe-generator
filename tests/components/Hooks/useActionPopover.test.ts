/*
Note: this entire hook was almost all tested by GPT4-o with very minor tweaks from me
see: gpt-testing.md
*/

import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import useActionPopover from "../../../src/components/Hooks/useActionPopover";
import { call_api, playAudio } from '../../../src/utils/utils';
import { stub_recipe_1 } from "../../stub";

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../../../src/utils/utils', () => ({
    call_api: jest.fn(),
    playAudio: jest.fn(),
}));

describe('useActionPopover', () => {

    let routerPushMock: any;

    beforeEach(() => {
        process.env = {
            ...process.env,
            NEXT_PUBLIC_API_BASE_URL: 'stub-base-url',
        };
        routerPushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: routerPushMock,
            events: {
                on: jest.fn(),
                off: jest.fn(),
            },
        });
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('handleClone navigates to the recipe creation page with query', () => {
        const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));

        act(() => {
            result.current.handleClone();
        });

        expect(routerPushMock).toHaveBeenCalledWith({
            pathname: '/CreateRecipe',
            query: {
                oldIngredients: ["Recipe_1_Ingredient_1", "Recipe_1_Ingredient_2"],
            },
        });
    });

    test('handleCopy writes text to clipboard and updates linkCopied state', async () => {
        const clipboardWriteMock = jest.fn();
        Object.assign(navigator, { clipboard: { writeText: clipboardWriteMock } });

        const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));

        await act(async () => {
            await result.current.handleCopy();
        });

        expect(clipboardWriteMock).toHaveBeenCalledWith(
            `stub-base-url/RecipeDetail?recipeId=6683b8d38475eac9af5fe838`
        );
        expect(result.current.linkCopied).toBe(true);

        act(() => {
            jest.runAllTimers(); // Simulate 2 seconds for resetting linkCopied state
        });

        expect(result.current.linkCopied).toBe(false);
    });

    test('handlePlayRecipe calls playAudio when recipe has audio', async () => {
        const mockAudioRecipe = { ...stub_recipe_1, audio: 'audio-link' };
        const { result } = renderHook(() => useActionPopover(mockAudioRecipe, jest.fn()));

        await act(async () => {
            await result.current.handlePlayRecipe();
        });

        expect(playAudio).toHaveBeenCalledWith(
            'audio-link',
            expect.any(Object), // audioRef
            expect.any(Function) // onEnd callback
        );
        expect(result.current.isPlayingAudio).toBe(true);
    });

    test('handlePlayRecipe generates and pauses the audio when recipe has no audio', async () => {
        (call_api as jest.Mock).mockResolvedValue({ audio: 'generated-audio-link' });

        const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));

        await act(async () => {
            await result.current.handlePlayRecipe();
        });

        expect(call_api).toHaveBeenCalledWith({
            address: '/api/tts',
            method: 'post',
            payload: { recipeId: '6683b8d38475eac9af5fe838' },
        });
    });

    test('killAudio stops playback and resets states', () => {
        const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));

        act(() => {
            result.current.killAudio();
        });

        expect(result.current.isPlayingAudio).toBe(false);
        expect(result.current.isLoadingAudio).toBe(false);
    });

    test('handleDeleteRecipe calls delete API', async () => {
        (call_api as jest.Mock).mockResolvedValue({ success: true });

        const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));

        let response;
        await act(async () => {
            response = await result.current.handleDeleteRecipe();
        });

        expect(call_api).toHaveBeenCalledWith({
            address: `/api/delete-recipe?recipeId=6683b8d38475eac9af5fe838`,
            method: 'delete',
        });
        expect(response).toEqual({ success: true });
    });
});
