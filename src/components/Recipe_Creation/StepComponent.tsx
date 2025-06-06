import IngredientForm from './IngredientForm';
import DietaryPreferences from './DietaryPreferences';
import ReviewComponent from './ReviewIngredients';
import SelectRecipesComponent from './SelectRecipes';
import { Ingredient, DietaryPreference, Recipe, IngredientDocumentType } from '../../types/index'

interface StepComponentProps {
    step: number,
    ingredientList: IngredientDocumentType[]
    ingredients: Ingredient[],
    updateIngredients: (ingredients: Ingredient[]) => void
    preferences: DietaryPreference[]
    updatePreferences: (preferences: DietaryPreference[]) => void
    editInputs: () => void
    handleIngredientSubmit: () => void
    generatedRecipes: Recipe[]
    updateSelectedRecipes: (ids: string[]) => void
    selectedRecipes: string[]
    handleRecipeSubmit: (recipes: Recipe[]) => void
}

function StepComponent({
    step,
    ingredientList,
    ingredients,
    updateIngredients,
    preferences,
    updatePreferences,
    editInputs,
    handleIngredientSubmit,
    generatedRecipes,
    selectedRecipes,
    updateSelectedRecipes,
    handleRecipeSubmit
}: StepComponentProps) {
    return (
        <div className="mt-8">
            {(() => {
                switch (step) {
                    case 0:
                        return (
                            <IngredientForm
                                ingredientList={ingredientList}
                                ingredients={ingredients}
                                updateIngredients={updateIngredients}
                                generatedRecipes={generatedRecipes}
                            />
                        );
                    case 1:
                        return (
                            <DietaryPreferences
                                preferences={preferences}
                                updatePreferences={updatePreferences}
                                generatedRecipes={generatedRecipes}
                            />
                        )
                    case 2:
                        return (
                            <ReviewComponent
                                ingredients={ingredients}
                                dietaryPreference={preferences}
                                onEdit={editInputs}
                                onSubmit={handleIngredientSubmit}
                                generatedRecipes={generatedRecipes}
                            />
                        )
                    case 3:
                        return (
                            <SelectRecipesComponent
                                generatedRecipes={generatedRecipes}
                                selectedRecipes={selectedRecipes}
                                updateSelectedRecipes={updateSelectedRecipes}
                                handleRecipeSubmit={handleRecipeSubmit}
                            />
                        )
                    default:
                        return <h1 className="text-center text-xl font-semibold text-gray-500">Coming Soon!</h1>;
                }
            })()}
        </div>
    )
}

export default StepComponent;
