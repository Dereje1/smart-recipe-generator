import IngredientForm from './IngredientForm';
import DietaryPreferences from './DietaryPreferences';
import ReviewComponent from './ReviewIngredients';
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
    generatedRecipes
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
                    default:
                        return <h1 className="text-center text-xl font-semibold text-gray-500">Coming Soon!</h1>;
                }
            })()}
        </div>
    )
}

export default StepComponent;
