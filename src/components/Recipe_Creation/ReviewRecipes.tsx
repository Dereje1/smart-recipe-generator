import React, { useEffect, useState } from 'react';
import RecipeCard from './RecipeCard';
import { Button } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Recipe } from '../../types/index'

interface ReviewRecipesComponentProps {
    generatedRecipes: Recipe[]
    selectedRecipes: string[]
    handleRecipeSubmit: (recipes: Recipe[]) => void
}

const initialRecipes: Recipe[] = [];

const ReviewRecipesComponent = ({ generatedRecipes, selectedRecipes, handleRecipeSubmit }: ReviewRecipesComponentProps) => {
    const [finalRecipes, setFinalRecipes] = useState(initialRecipes)

    useEffect(() => {
        const recipes = generatedRecipes.filter((recipe) => selectedRecipes.includes(recipe.openaiPromptId))
        setFinalRecipes(recipes)
    }, [generatedRecipes, selectedRecipes])

    return (
        <div className="flex flex-col mt-40">

            <div className="flex flex-wrap max-w-7xl">
                {
                    finalRecipes.map((recipe) => (
                        <RecipeCard
                            recipe={recipe}
                            key={recipe.openaiPromptId}
                            selectedRecipes={selectedRecipes}
                        />
                    ))
                }
            </div>
            <div className="mt-8 w-full flex justify-center">
                {finalRecipes.length ? (
                    <Button
                        onClick={() => handleRecipeSubmit(finalRecipes)}
                        className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                        aria-label="Submit selected recipes"
                    >
                        <CheckIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                        Submit Selected Recipes
                    </Button>
                ) : (
                    <div className="text-center text-red-500 font-medium px-4 py-3 rounded-lg bg-red-100">
                        No recipes selected for submission. Please select at least one recipe. If you navigate away, all recipes will be discarded.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewRecipesComponent;
