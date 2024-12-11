import React from 'react';
import { Button } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import RecipeCard from './RecipeCard';
import { Recipe } from '../../types/index'

interface SelectRecipesComponentProps {
    generatedRecipes: Recipe[]
    updateSelectedRecipes: (ids: string[]) => void
    selectedRecipes: string[]
}

const SelectRecipesComponent = ({ generatedRecipes, selectedRecipes, updateSelectedRecipes }: SelectRecipesComponentProps) => {

    const handleRecipeSelection = (recipeId: string) => {
        const updatedSelections = selectedRecipes.includes(recipeId) ? selectedRecipes.filter((p) => p !== recipeId) : [...selectedRecipes, recipeId]
        updateSelectedRecipes(updatedSelections)
    }

    const handleSelectAll = () => {
        const allIds = generatedRecipes.map(recipe => recipe.openaiPromptId);
        updateSelectedRecipes(allIds)
    }

    return (
        <div className="flex flex-col mt-40">
            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full justify-center">
                <Button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition duration-300 ease-in-out"
                    aria-label="Select all recipes"
                >
                    <CheckIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Select All
                </Button>
                <Button
                    onClick={() => updateSelectedRecipes([])}
                    className="flex items-center justify-center bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out"
                    aria-label="Unselect all recipes"
                >
                    <XMarkIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Unselect All
                </Button>
            </div>
            <div className="flex flex-wrap max-w-7xl">
                {
                    generatedRecipes.map((recipe) => (
                        <RecipeCard
                            recipe={recipe}
                            key={recipe.openaiPromptId}
                            handleRecipeSelection={handleRecipeSelection}
                            selectedRecipes={selectedRecipes}
                            showSwitch
                        />
                    ))
                }
            </div>
        </div>
    );
};

export default SelectRecipesComponent;
