import { Switch, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Recipe } from '../../types/index';

interface RecipeCardProps {
    recipe: Recipe;
    handleRecipeSelection?: (id: string) => void;
    selectedRecipes: string[];
    showSwitch?: boolean;
    removeMargin?: boolean;
}

const RecipeCard = ({ recipe, handleRecipeSelection, selectedRecipes, showSwitch, removeMargin }: RecipeCardProps) => {
    const parentClassName = `max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden relative ${removeMargin ? '' : 'mt-10 mb-5'}`;

    return (
        <div className={`${parentClassName} overflow-x-hidden`} key={recipe.name}>
            <div className="px-6 py-4 relative">

                {/* === Recipe Title and Optional Switch === */}
                <div className="flex justify-between items-center">
                    <div className="font-bold text-2xl mb-4">{recipe.name}</div>

                    {/* Optional Switch to Select Recipe */}
                    {showSwitch && (
                        <Switch
                            checked={selectedRecipes.includes(recipe.openaiPromptId)}
                            onChange={() =>
                                handleRecipeSelection ? handleRecipeSelection(recipe.openaiPromptId) : undefined
                            }
                            className={`${
                                selectedRecipes.includes(recipe.openaiPromptId) ? 'bg-green-500' : 'bg-gray-300'
                            } relative inline-flex h-[28px] w-[54px] cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                        >
                            <span className="sr-only">Use setting</span>
                            <span
                                aria-hidden="true"
                                className={`${
                                    selectedRecipes.includes(recipe.openaiPromptId) ? 'translate-x-7' : 'translate-x-0'
                                } pointer-events-none inline-block h-[24px] w-[23px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                            />
                        </Switch>
                    )}
                </div>

                {/* === Ingredients Section === */}
                <h3 className="text-gray-700 font-semibold text-lg">Ingredients:</h3>
                <ul className="mb-4 flex flex-wrap gap-2">
                    {recipe.ingredients.map((ingredient) => (
                        <li key={ingredient.name}>
                            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {`${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity})` : ''}`}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* === Dietary Preferences === */}
                <h3 className="text-gray-700 font-semibold text-lg">Dietary Preference:</h3>
                <div className="mb-5 mt-2 flex flex-wrap gap-2">
                    {recipe.dietaryPreference.map((preference) => (
                        <span
                            key={preference}
                            className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded"
                        >
                            {preference}
                        </span>
                    ))}
                </div>

                {/* === Collapsible: Instructions === */}
                <Disclosure>
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex justify-between w-full px-4 py-2 text-lg font-semibold text-left text-indigo-900 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none">
                                <span>Instructions</span>
                                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                            </DisclosureButton>

                            <DisclosurePanel
                                className={`mt-2 px-4 pt-4 pb-2 text-sm leading-relaxed bg-gray-50 border border-gray-200 rounded-lg space-y-2 transition-all duration-300 ease-in-out ${
                                    open ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'
                                } overflow-hidden`}
                            >
                                <ol className="list-decimal ml-5 space-y-2">
                                    {recipe.instructions.map((instruction, idx) => (
                                        <li key={idx}>
                                            {instruction.replace(/^\d+\.\s*/, '')} {/* Remove any manual numbering */}
                                        </li>
                                    ))}
                                </ol>
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>

                {/* === Collapsible: Additional Information === */}
                <Disclosure as="div" className="mt-4">
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex justify-between w-full px-4 py-2 text-lg font-semibold text-left text-indigo-900 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none">
                                <span>Additional Information</span>
                                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                            </DisclosureButton>

                            <DisclosurePanel
                                className={`mt-2 px-4 pt-4 pb-2 text-xs leading-relaxed bg-gray-50 border border-gray-200 rounded-lg space-y-2 transition-all duration-300 ease-in-out ${
                                    open ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'
                                } overflow-hidden`}
                            >
                                <div><strong>Tips:</strong> {recipe.additionalInformation.tips}</div>
                                <div><strong>Variations:</strong> {recipe.additionalInformation.variations}</div>
                                <div><strong>Serving Suggestions:</strong> {recipe.additionalInformation.servingSuggestions}</div>
                                <div><strong>Nutritional Information:</strong> {recipe.additionalInformation.nutritionalInformation}</div>
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>
            </div>
        </div>
    );
};

export default RecipeCard;
