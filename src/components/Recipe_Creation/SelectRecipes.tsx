import React from 'react';
import RecipeCard from './RecipeCard';
import { Recipe } from '../../types/index';

interface SelectRecipesComponentProps {
    generatedRecipes: Recipe[];
    updateSelectedRecipes: (ids: string[]) => void;
    selectedRecipes: string[];
}

const SelectRecipesComponent = ({ generatedRecipes, selectedRecipes, updateSelectedRecipes }: SelectRecipesComponentProps) => {

    const handleRecipeSelection = (recipeId: string) => {
        const updatedSelections = selectedRecipes.includes(recipeId)
            ? selectedRecipes.filter((p) => p !== recipeId)
            : [...selectedRecipes, recipeId];
        updateSelectedRecipes(updatedSelections);
    };

    return (
        <div className="flex flex-col">
            {/* Optional Helper Text */}
            <p className="text-center text-gray-500 text-sm mb-4">
                Use the switch on each recipe to select or unselect.
            </p>

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
        </div>
    );
};

export default SelectRecipesComponent;
