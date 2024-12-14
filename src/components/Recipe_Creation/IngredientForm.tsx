import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import NewIngredientDialog from './NewIngredientDialog';
import { Ingredient, Recipe, IngredientDocumentType } from '../../types/index';

type ComboIngredient = { id: number; name: string };

const initialComboIngredient: ComboIngredient = { id: 0, name: '' };

const Chip = ({ ingredient, onDelete }: { ingredient: Ingredient; onDelete: (id: string) => void }) => {
    return (
        <div className="flex items-center bg-indigo-500 text-white text-sm font-medium px-3 py-1.5 rounded-full m-1">
            <span>{`${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity})` : ''}`}</span>
            <button onClick={() => onDelete(ingredient.id)} className="ml-2 focus:outline-none">
                <XMarkIcon className="w-4 h-4 text-white hover:text-gray-200" />
            </button>
        </div>
    );
};

interface IngredientListProps {
    ingredientList: IngredientDocumentType[];
    ingredientUpdate: (val: string | undefined) => void;
    generatedRecipes: Recipe[];
}

function IngredientList({ ingredientList, ingredientUpdate, generatedRecipes }: IngredientListProps) {
    const [selectedIngredient, setSelectedIngredient] = useState(initialComboIngredient);
    const [query, setQuery] = useState('');

    const filteredIngredients: IngredientDocumentType[] =
        query === ''
            ? ingredientList
            : ingredientList.filter((ingredient) =>
                ingredient.name.toLowerCase().includes(query.toLowerCase())
            );

    const handleSelectedIngredient = (ingredient: ComboIngredient) => {
        setSelectedIngredient(initialComboIngredient);
        ingredientUpdate(ingredient?.name);
    };

    return (
        <div className="relative w-full">
            <Combobox
                value={selectedIngredient}
                onChange={handleSelectedIngredient}
                onClose={() => setQuery('')}
                disabled={Boolean(generatedRecipes.length)}
            >
                <div className="relative w-full">
                    <Combobox.Input
                        className={clsx(
                            'w-full rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-4 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                        )}
                        displayValue={(ingredient: ComboIngredient) => ingredient?.name}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Select an existing ingredient"
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    </Combobox.Button>
                </div>

                {filteredIngredients.length > 0 && (
                    <Combobox.Options
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                    >
                        {filteredIngredients.map((ingredient) => (
                            <Combobox.Option
                                key={ingredient._id}
                                value={ingredient}
                                className={({ active }) =>
                                    `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'text-white bg-indigo-600' : 'text-gray-900'
                                    }`
                                }
                            >
                                {({ active, selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                }`}
                                        >
                                            {ingredient.name}
                                        </span>
                                        {selected && (
                                            <span
                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-600'
                                                    }`}
                                            >
                                                <CheckIcon className="w-5 h-5" aria-hidden="true" />
                                            </span>
                                        )}
                                    </>
                                )}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </Combobox>
        </div>
    );
}

interface IngredientFormProps {
    ingredientList: IngredientDocumentType[];
    ingredients: Ingredient[];
    updateIngredients: (ingredients: Ingredient[]) => void;
    generatedRecipes: Recipe[];
}

export default function IngredientForm({
    ingredientList: originalIngredientList,
    ingredients,
    updateIngredients,
    generatedRecipes,
}: IngredientFormProps) {
    const [ingredientList, setIngredientList] = useState(originalIngredientList);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (val: string | undefined) => {
        if (!val) return;
        const isRepeat = ingredients.some(
            (i) => i.name.toLowerCase() === val.toLowerCase()
        );
        if (isRepeat) {
            setError('This ingredient is already selected.');
            return;
        }
        if(ingredients.length >= 10){
            setError('You can select up to 10 ingredients only.');
            return
        }
        setError(null);
        updateIngredients([
            ...ingredients,
            { name: val, id: uuidv4() },
        ]);
    };

    const deleteIngredient = (id: string) => {
        if (Boolean(generatedRecipes.length)) return;
        updateIngredients(ingredients.filter((ingredient) => ingredient.id !== id));
    };

    return (
        <div
            className="fixed top-36 mt-32 pl-2 left-1/2 transform -translate-x-1/2 px-4 py-6 bg-white shadow-md rounded-xl sm:max-w-md mx-auto"
            style={{ width: '98%' }}
        >
            {/* Enhanced "Add New Ingredient" Button */}
            <div className="flex justify-end w-full">
                <NewIngredientDialog
                    ingredientList={ingredientList}
                    updateIngredientList={(newIngredient) => setIngredientList([...ingredientList, newIngredient])}
                />
            </div>
            <div className="mt-4 w-full">
                <IngredientList
                    ingredientList={ingredientList}
                    ingredientUpdate={(val) => handleChange(val)}
                    generatedRecipes={generatedRecipes}
                />
                {error && (
                    <p className="mt-2 text-red-500 text-sm">
                        {error}
                    </p>
                )}
            </div>
            {ingredients.length > 0 && (
                <div className="mt-6 w-full">
                    <h2 className="text-lg font-semibold text-indigo-600 mb-3">Selected Ingredients:</h2>
                    <div className="flex flex-wrap max-h-32 overflow-y-auto">
                        {ingredients.map((ingredient: Ingredient) => (
                            <Chip
                                ingredient={ingredient}
                                key={ingredient.id}
                                onDelete={(id: string) => deleteIngredient(id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
