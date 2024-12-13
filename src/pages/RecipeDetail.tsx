// src/components/RecipeDetail.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';
import { HandThumbUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { Button } from '@headlessui/react';
import Loading from "../components/Loading";
import ErrorPage from "./auth/error";
import { call_api, formatDate } from "../utils/utils";
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
                {/* Recipe Image using Next.js Image component */}
                <div className="relative w-full h-80">
                    <Image
                        src={recipeData.imgLink} // Image source from recipe data
                        alt={recipeData.name} // Alt text for accessibility
                        fill // Fill the parent container
                        style={{ objectFit: 'cover' }} // Ensure the image covers the container without distortion
                        className="transform hover:scale-105 transition-transform duration-300" // Add hover effect for scaling
                        priority // Load the image with high priority
                    />
                </div>

                <div className="p-6">
                    {/* Recipe Title */}
                    <h2 className="text-2xl font-bold mb-2">{recipeData.name}</h2> {/* Title with styling */}

                    {/* Owner Information */}
                    <div className="flex items-center mb-6">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                            <Image
                                src={recipeData.owner.image} // Owner's image source
                                alt={recipeData.owner.name} // Alt text for accessibility
                                fill // Fill the parent container
                                style={{ objectFit: 'cover' }} // Ensure the image covers the container
                                className="rounded-full" // Make the image circular
                            />
                        </div>
                        <div>
                            <span className="text-gray-700 text-lg">By {recipeData.owner.name}</span> {/* Owner's name */}
                            <p className="text-sm text-gray-500">{formatDate(recipeData.createdAt)}</p>
                        </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">Dietary Preferences</h3> {/* Section title */}
                        <div className="flex flex-wrap gap-2"> {/* Flex container with wrapping and gap */}
                            {recipeData.dietaryPreference.map((preference) => (
                                <span
                                    key={preference} // Unique key for each preference
                                    className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full" // Badge styling
                                >
                                    {preference} {/* Display the dietary preference */}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Ingredients */}
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

