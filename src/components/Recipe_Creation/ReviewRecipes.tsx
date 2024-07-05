import React, { useEffect, useState } from 'react';
import RecipeCard from './RecipeCard';
import { Button } from '@headlessui/react';
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
        <div className="flex flex-col">

            <div className="flex flex-wrap">
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
            <div className="flex w-[300px] max-w-md mx-auto justify-center mb-3">
                {
                    finalRecipes.length ?
                        <Button 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                        onClick={()=> handleRecipeSubmit(finalRecipes)}
                        >
                            Submit Selected Recipes
                        </Button>
                        :
                        <div className="mt-4 text-red-500 font-bold">
                            No recipes selected for submission. Please select at least one recipe. If you navigate away, all recipes will be discarded.
                        </div>
                }

            </div>
        </div>
    );
};

export default ReviewRecipesComponent;
