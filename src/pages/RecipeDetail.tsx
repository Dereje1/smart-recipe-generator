import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';
import { HandThumbUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid'
import useActionPopover from "../components/Hooks/useActionPopover";
import { ActionPopover } from "../components/Recipe_Display/ActionPopover";
import RecipeHeader from "../components/RecipeHeader";
import Loading from "../components/Loading";
import ErrorPage from "./auth/error";
import { call_api } from "../utils/utils";
import { ExtendedRecipe } from '../types';

export default function RecipeDetail() {
    const router = useRouter();
    const { recipeId } = router.query as { recipeId?: string }; // Extract recipeId from the URL query parameters

    // State to hold the fetched recipe data
    const [recipeData, setRecipeData] = useState<ExtendedRecipe | null>(null);
    // State to manage the loading state
    const [loading, setLoading] = useState<boolean>(true);
    // State to handle any errors during data fetching
    const [error, setError] = useState<string | null>(null);

    const updateRecipe = (audioLink: string) => {
        setRecipeData((prevRecipdata) => {
            if (!prevRecipdata) return null; // Ensure we're not working with null

            return {
                ...prevRecipdata, // Keep all existing properties
                audio: audioLink, // Update only what's necessary
            };
        });
    }

    const {
        handleClone,
        handleCopy,
        handlePlayRecipe,
        handleDeleteDialog,
        handleDeleteRecipe,
        linkCopied,
        isPlayingAudio,
        isLoadingAudio,
        isDeleteDialogOpen
    } = useActionPopover(recipeData, updateRecipe);

    useEffect(() => {
        async function fetchRecipe() {
            try {
                // Make an API call to fetch the single recipe data
                const data = await call_api({
                    address: `/api/get-single-recipe?recipeId=${recipeId}`,
                });
                setRecipeData(data); // Update state with fetched data
            } catch (err) {
                setError((err as Error).message); // Update state with error message
            } finally {
                setLoading(false); // Set loading to false after fetching is complete
            }
        }

        if (recipeId) {
            fetchRecipe(); // Initiate data fetching if recipeId is present
        }
    }, [recipeId]); // Dependency array ensures the effect runs when recipeId changes


    const deleteAndRemoveRecipe = async () => {
        try {
            setLoading(true)
            const { message, error } = await handleDeleteRecipe();
            setLoading(false)
            router.push('/')
        } catch (error) {
            console.error(error)
        }
    }

    // Render the ErrorPage component if recipeId is not present
    if (!recipeId) return <ErrorPage message="Invalid Recipe" />;
    // Render the Loading component while data is being fetched
    if (loading) return <Loading />;
    // Render the ErrorPage component if an error occurred during fetching
    if (error) return <ErrorPage message={error} />;
    // Render a fallback message if no recipe data is found
    if (!recipeData) return <ErrorPage message="No Recipe Data" />;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Recipe Card */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <RecipeHeader recipeData={recipeData} /> {/* Recipe header with image and title */}
                <div className="p-6">
                    <ActionPopover
                        handlers={{
                            handleClone,
                            handleCopy,
                            deleteDialog: handleDeleteDialog,
                            handlePlayRecipe,
                            deleteRecipe: deleteAndRemoveRecipe,
                        }}
                        states={{
                            hasAudio: Boolean(recipeData.audio),
                            isLoadingAudio,
                            isPlayingAudio,
                            linkCopied,
                            isDeleteDialogOpen,
                        }}
                        data={{
                            recipe: recipeData,
                            buttonType: <EllipsisHorizontalIcon className="h-6 w-6 text-gray-700" />
                        }}

                    />
                    {/* Ingredients */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">Ingredients</h3> {/* Section title */}
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Responsive grid layout */}
                                {recipeData.ingredients.map((ingredient) => (
                                    <li key={ingredient.name} className="flex items-center"> {/* Ingredient item */}
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" /> {/* Icon next to ingredient */}
                                        <span className="text-gray-700">
                                            {ingredient.name}{ingredient.quantity && ` (${ingredient.quantity})`} {/* Ingredient name and quantity */}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>


                    {/* Instructions */}
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">Instructions</h3> {/* Section title */}
                        <ol className="list-decimal list-inside space-y-4"> {/* Ordered list with spacing */}
                            {recipeData.instructions.map((step, index) => (
                                <li key={index} className="flex items-start"> {/* Instruction step */}
                                    <span className="font-bold text-gray-800 mr-3">{index + 1}.</span> {/* Step number */}
                                    <p className="text-gray-700">{step}</p> {/* Instruction text */}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Additional Information */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h3> {/* Section title */}
                        <div className="space-y-4"> {/* Spacing between info items */}
                            <div>
                                <h4 className="font-bold text-gray-700">Tips:</h4> {/* Subsection title */}
                                <p className="text-gray-600">{recipeData.additionalInformation.tips}</p> {/* Tips content */}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-700">Variations:</h4> {/* Subsection title */}
                                <p className="text-gray-600">{recipeData.additionalInformation.variations}</p> {/* Variations content */}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-700">Serving Suggestions:</h4> {/* Subsection title */}
                                <p className="text-gray-600">{recipeData.additionalInformation.servingSuggestions}</p> {/* Serving suggestions content */}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-700">Nutritional Information:</h4> {/* Subsection title */}
                                <p className="text-gray-600">{recipeData.additionalInformation.nutritionalInformation}</p> {/* Nutritional information content */}
                            </div>
                        </div>
                    </div>

                    {/* Liked By Section */}
                    {recipeData.likedBy.length > 0 &&
                        <>
                            <HandThumbUpIcon className="size-8 text-blue-500 mr-2 mb-2" /> {/* Like icon */}
                            <div className="flex items-center">
                                <div className="flex flex-wrap items-center gap-2">
                                    {recipeData.likedBy.map((user, idx) => (
                                        <div key={user._id} className="flex items-center space-x-2"> {/* User item */}
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden"> {/* User avatar container */}
                                                <Image
                                                    src={user.image} // User's image source
                                                    alt={user.name} // Alt text for accessibility
                                                    fill // Fill the parent container
                                                    style={{ objectFit: 'cover' }} // Ensure the image covers the container
                                                    className="rounded-full" // Make the image circular
                                                />
                                            </div>
                                            <span className="text-gray-700">{user.name}</span> {/* User's name */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}

