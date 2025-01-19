import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { call_api, playAudio } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

function useActionPopover(recipe: ExtendedRecipe | null) {
    const [linkCopied, setLinkCopied] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Stop audio when navigating away
        const handleRouteChange = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
                setIsPlayingAudio(false)
            }
        };

        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [router.events]);

    const handleClone = () => {
        router.push({
            pathname: '/CreateRecipe',
            query: {
                oldIngredients: recipe?.ingredients.map((i) => i.name),
            },
        });
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/RecipeDetail?recipeId=${recipe?._id}`
            );
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleDeleteDialog = () => setIsDeleteDialogOpen((prevState) => !prevState)


    const killAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlayingAudio(false);
            setIsLoadingAudio(false); // Ensure loading state is reset
        }
    }

    const handlePlayRecipe = async () => {
        try {
            if (isPlayingAudio) {
                killAudio()
                return
            }
            setIsLoadingAudio(true);
            setIsPlayingAudio(true);
            if (recipe?.audio) {
                await playAudio(recipe.audio, audioRef, () => {
                    setIsPlayingAudio(false);
                });
                return;
            }

            const recipeText = `
            Here is the recipe for: ${recipe?.name}.
            Ingredients: 
            ${recipe?.ingredients.map((ing) => `${ing.name}: ${ing.quantity}`).join('. ')}.
            Instructions: 
            ${recipe?.instructions.join('. ')}.
            Tips: 
            ${recipe?.additionalInformation.tips}.
            Variations: 
            ${recipe?.additionalInformation.variations}.
            Serving Suggestions: 
            ${recipe?.additionalInformation.servingSuggestions}.
            `;

            const response = await call_api({
                address: '/api/tts',
                method: 'post',
                payload: { text: recipeText, recipeId: recipe?._id },
            });

            await playAudio(response.audio, audioRef, () => {
                setIsPlayingAudio(false);
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            killAudio()
        } finally {
            setIsLoadingAudio(false);
        }
    };

    const handleDeleteRecipe = async () => {
        try {
            const response = await call_api({
                address: '/api/delete-recipe',
                method: 'delete',
                payload: { data: { recipeId: recipe?._id } }
            })
            return response;
        } catch (error) {
            console.error(error)
        }
    }

    return {
        handleClone,
        handleCopy,
        handlePlayRecipe,
        killAudio,
        handleDeleteDialog,
        handleDeleteRecipe,
        linkCopied,
        isLoadingAudio,
        isPlayingAudio,
        isDeleteDialogOpen
    };
}

export default useActionPopover;