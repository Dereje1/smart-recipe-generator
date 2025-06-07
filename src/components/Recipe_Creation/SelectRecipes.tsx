import React from 'react';
import RecipeCard from '../RecipeCard';
import { Button } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Recipe } from '../../types/index';

interface SelectRecipesComponentProps {
    generatedRecipes: Recipe[];
    updateSelectedRecipes: (ids: string[]) => void;
    selectedRecipes: string[];
    handleRecipeSubmit: (recipes: Recipe[]) => void;
}

const SelectRecipesComponent = ({ generatedRecipes, selectedRecipes, updateSelectedRecipes, handleRecipeSubmit }: SelectRecipesComponentProps) => {

    const handleRecipeSelection = (recipeId: string) => {
        const updatedSelections = selectedRecipes.includes(recipeId)
            ? selectedRecipes.filter((p) => p !== recipeId)
            : [...selectedRecipes, recipeId];
        updateSelectedRecipes(updatedSelections);
    };

    const finalRecipes = generatedRecipes.filter((recipe) =>
        selectedRecipes.includes(recipe.openaiPromptId)
    );

    return (
        <div className="flex flex-col">

            {/* Responsive Recipe Cards with Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedRecipes.map((recipe) => (
                    <div key={recipe.openaiPromptId}>
                        <RecipeCard
                            recipe={recipe}
                            handleRecipeSelection={handleRecipeSelection}
                            selectedRecipes={selectedRecipes}
                            showSwitch
                        />
                    </div>
                ))}
            </div>
            <div className="mt-8 w-full flex justify-center">
                {finalRecipes.length ? (
                    <Button
                        onClick={() => handleRecipeSubmit(finalRecipes)}
                        className="flex items-center bg-brand-600 text-white px-6 py-3 rounded-full hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition duration-300 ease-in-out"
                        aria-label="Submit selected recipes"
                    >
                        <CheckIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                        {`Submit Selected (${finalRecipes.length}) Recipes`}
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

export default SelectRecipesComponent;
