import React from 'react';
import RecipeCard from './RecipeCard';
import { Recipe } from '../../types/index'
import { Button } from '@headlessui/react';

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
        <div className="flex flex-col">
            <div className="flex w-[300px] max-w-md mx-auto justify-center">
                <Button className="bg-white text-black px-4 py-2 rounded-md hover:underline hover:text-blue-500" onClick={handleSelectAll}>
                    Select All
                </Button>
                <Button className="bg-white text-black px-4 py-2 rounded-md hover:underline hover:text-blue-500" onClick={() => updateSelectedRecipes([])}>
                    Unselect All
                </Button>
            </div>
            <div className="flex flex-wrap">
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
