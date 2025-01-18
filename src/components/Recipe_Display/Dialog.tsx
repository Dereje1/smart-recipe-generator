import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { DialogBackdrop, Dialog, DialogPanel } from '@headlessui/react';
import Image from 'next/image';
import RecipeCard from '../Recipe_Creation/RecipeCard';
import DeleteDialog from './DeleteDialog';
import Loading from '../Loading';
import { ActionPopover, Alert } from './ActionPopover';
import { formatDate, call_api, playAudio } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

interface RecipeDialogProps {
    isOpen: boolean;
    close: () => void;
    recipe: ExtendedRecipe | null;
    deleteRecipe: () => void;
}

export default function RecipeDisplayModal({ isOpen, close, recipe, deleteRecipe }: RecipeDialogProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null); // Track the audio instance
    const router = useRouter();

    useEffect(() => {
        // Stop audio when navigating away
        const handleRouteChange = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };

        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [router.events]);

    useEffect(() => {
        if (!isOpen && audioRef.current) {
            // Stop audio playback when the modal is closed
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, [isOpen]);

    const handleClone = () => {
        router.push({
            pathname: '/CreateRecipe',
            query: {
                oldIngredients: recipe?.ingredients.map(i => i.name)
            }
        });
    };

    const handleCopy = async (recipeId: string) => {
        try {
            await navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/RecipeDetail?recipeId=${recipeId}`
            );
            setCopied(true);
            setTimeout(() => {
                setCopied(false)
            }, 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };
 
    const handlePlayRecipe = async () => {
        try {
            setIsLoadingAudio(true);
    
            // If the audio field exists, preload and play the audio
            if (recipe?.audio) {
                await playAudio(recipe.audio, audioRef);
                return; // Exit early, no need to call the API
            }
    
            // Construct the recipe text to send to the API
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
    
            // Send a POST request to the /api/tts endpoint
            const response = await call_api({
                address: '/api/tts',
                method: 'post',
                payload: { text: recipeText, recipeId: recipe?._id },
            });
    
            // The API returns the S3 URL of the uploaded audio
            const audioSrc = response.audio;
    
            // Preload and play the audio
            await playAudio(audioSrc, audioRef);
        } catch (error) {
            console.error('Error playing audio:', error);
        } finally {
            setIsLoadingAudio(false);
        }
    };
    


    if (!recipe) return null;

    return (
        <>
            <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
                <DialogBackdrop className="fixed inset-0 bg-black/50" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-md rounded-xl bg-white p-1 backdrop-blur-2xl duration-300 ease-out"
                        >
                            <div className="flex flex-col items-center">
                                {
                                    !isLoadingAudio && <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center mb-2 mt-2 ml-2 bg-gray-100 p-2 rounded-lg">
                                            <Image
                                                className="h-10 w-10 rounded-full"
                                                src={
                                                    recipe.owner.image ||
                                                    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                                                }
                                                alt={`Profile-Picture-${recipe.owner.name}`}
                                                width={25}
                                                height={25}
                                            />
                                            <div className="ml-4">
                                                <p className="text-lg font-semibold text-gray-900">{recipe.owner.name}</p>
                                                <p className="text-sm text-gray-500">{formatDate(recipe.createdAt)}</p>
                                            </div>
                                        </div>
                                        <ActionPopover
                                            handleClone={handleClone}
                                            handleCopy={() => handleCopy(recipe._id)}
                                            closeDialog={close}
                                            deleteDialog={recipe.owns ? () => setIsDeleteDialogOpen(true) : undefined}
                                            recipeId={recipe._id}
                                            handlePlayRecipe={handlePlayRecipe}
                                            hasAudio={Boolean(recipe.audio)}
                                        />
                                    </div>
                                }
                                {
                                    isLoadingAudio ?
                                        <Loading />
                                        :
                                        <RecipeCard recipe={recipe} selectedRecipes={[]} removeMargin />
                                }
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                recipeName={recipe.name}
                closeDialog={() => setIsDeleteDialogOpen(false)}
                deleteRecipe={() => {
                    setIsDeleteDialogOpen(false);
                    deleteRecipe();
                }}
            />
            {copied && (
                <div id="alert-container">
                    <Alert message={`${recipe.name} copied to clipboard!`} />
                </div>
            )}
        </>
    );
}
