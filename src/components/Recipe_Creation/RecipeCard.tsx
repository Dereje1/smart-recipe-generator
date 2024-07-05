import { Switch } from '@headlessui/react'
import { Recipe } from '../../types/index'

interface RecipeCardProps {
    recipe: Recipe
    handleRecipeSelection?: (id: string) => void
    selectedRecipes: string[]
    showSwitch?: boolean
    removeMargin?: boolean
}

const RecipeCard = ({ recipe, handleRecipeSelection, selectedRecipes, showSwitch, removeMargin }: RecipeCardProps) => {
    const parentClassName = `max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${removeMargin ? '' : 'mt-10 mb-5'}` 
    return (
        <div className={parentClassName} key={recipe.name}>
            <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="font-bold text-2xl mb-4">{recipe.name}</div>
                    {
                        showSwitch && <Switch
                            checked={selectedRecipes.includes(recipe.openaiPromptId)}
                            onChange={() => handleRecipeSelection ? handleRecipeSelection(recipe.openaiPromptId) : undefined}
                            className={`${selectedRecipes.includes(recipe.openaiPromptId) ? 'bg-green-500' : 'bg-gray-300'}
          relative inline-flex h-[28px] w-[54px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
                        >
                            <span className="sr-only">Use setting</span>
                            <span
                                aria-hidden="true"
                                className={`${selectedRecipes.includes(recipe.openaiPromptId) ? 'translate-x-7' : 'translate-x-0'}
            pointer-events-none inline-block h-[24px] w-[23px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                            />
                        </Switch>
                    }
                </div>
                <h3 className="text-gray-700 font-semibold text-lg">Ingredients:</h3>
                <ul className="mb-4 flex flex-wrap gap-2">
                    {recipe.ingredients.map((ingredient) => (
                        <li key={ingredient.name} className="flex justify-between gap-x-2">
                            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {`${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity})` : ''}`}
                            </span>
                        </li>
                    ))}
                </ul>

                <h3 className="text-gray-700 font-semibold text-lg">Dietary Preference:</h3>
                <div className="mb-5 mt-2 flex flex-wrap gap-2">
                    {recipe.dietaryPreference.map((preference) => (
                        <span key={preference} className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">
                            {preference}
                        </span>
                    ))}
                </div>

                <h3 className="text-gray-700 font-semibold text-lg">Instructions:</h3>
                <ol className="mb-5 mt-2 space-y-2 bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    {recipe.instructions.map((instruction, idx) => (
                        <li className="text-gray-800 text-sm font-medium" key={instruction}>
                            {`${idx + 1}. ${instruction}`}
                        </li>
                    ))}
                </ol>

                <h3 className="text-gray-700 font-semibold text-lg">Additional Information:</h3>
                <div className="mb-5 mt-2 space-y-2">
                    <div className="text-gray-800 text-sm font-medium">
                        <strong>Tips:</strong> {recipe.additionalInformation.tips}
                    </div>
                    <div className="text-gray-800 text-sm font-medium">
                        <strong>Variations:</strong> {recipe.additionalInformation.variations}
                    </div>
                    <div className="text-gray-800 text-sm font-medium">
                        <strong>Serving Suggestions:</strong> {recipe.additionalInformation.servingSuggestions}
                    </div>
                    <div className="text-gray-800 text-sm font-medium">
                        <strong>Nutritional Information:</strong> {recipe.additionalInformation.nutritionalInformation}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecipeCard;