import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import NewIngredientDialog from './NewIngredientDialog';
import { Ingredient, Recipe, IngredientDocumentType } from '../../types/index'


type comboIngredient = { id: number, name: string }

const initialComboIngredient: comboIngredient = { id: 0, name: '' }

const Chip = ({ ingredient, onDelete }: { ingredient: Ingredient, onDelete: (id: string) => void }) => {
    return (
        <div className="flex">
            <span className="flex items-center bg-blue-600 text-white text-sm font-medium me-2 px-2.5 py-0.5 rounded m-2">{`${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity})` : ''}`}
                <div onClick={() => onDelete(ingredient.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x cursor-pointer hover:text-gray-300 rounded-full w-4 h-4 ml-2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
            </span>
        </div>
    )
}

interface IngredientListProps {
    ingredientList: IngredientDocumentType[]
    ingredientUpdate: (val: string | undefined) => void,
    generatedRecipes: Recipe[]
}

function IngredientList({ ingredientList, ingredientUpdate, generatedRecipes }: IngredientListProps) {
    const [selectedIngredient, setSelectedIngredient] = useState(initialComboIngredient)
    const [query, setQuery] = useState('')

    const filteredIngredients: IngredientDocumentType[] =
        query === ''
            ? ingredientList
            : ingredientList.filter((ingredient) => {
                return ingredient.name.toLowerCase().includes(query.toLowerCase())
            })

    const handleSelectedIngredient = (ingredient: comboIngredient) => {
        setSelectedIngredient(initialComboIngredient);
        ingredientUpdate(ingredient?.name)
    }
    return (
        <div className="mx-auto w-full pt-6">
            <Combobox
                value={selectedIngredient}
                onChange={handleSelectedIngredient}
                onClose={() => setQuery('')}
                immediate
                disabled={Boolean(generatedRecipes.length)}
            >
                <div className="relative">
                    <ComboboxInput
                        className={clsx(
                            'w-full rounded-lg border border-gray/20 bg-white py-2 pr-8 pl-3 text-base text-gray-900',
                            'focus:outline-none focus:ring-2 focus:ring-indigo-600'
                        )}
                        displayValue={(ingredient: comboIngredient) => ingredient?.name}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder='Choose Ingredient'
                    />
                    <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </ComboboxButton>
                </div>

                <ComboboxOptions
                    anchor="bottom"
                    transition
                    className={clsx(
                        'w-[var(--input-width)] rounded-xl border border-gray bg-white/100 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
                        'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                    )}
                >
                    {filteredIngredients.map((ingredient) => (
                        <ComboboxOption
                            key={ingredient._id}
                            value={ingredient}
                            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-black/10"
                        >
                            <CheckIcon className="invisible size-4 fill-black group-data-[selected]:visible" />
                            <div className="text-sm/6 text-gray-900">{ingredient.name}</div>
                        </ComboboxOption>
                    ))}
                </ComboboxOptions>
            </Combobox>
        </div>
    )
}

interface IngredientFormProps {
    ingredientList: IngredientDocumentType[],
    ingredients: Ingredient[],
    updateIngredients: (ingredients: Ingredient[]) => void
    generatedRecipes: Recipe[]
}

export default function IngredientForm({
    ingredientList: originalIngredientList,
    ingredients,
    updateIngredients,
    generatedRecipes
}: IngredientFormProps) {
    const [ingredientList, setIngredientList] = useState(originalIngredientList)

    const handleChange = (val: string | undefined) => {
        if (!val) return;
        const isRepeat = ingredients.some(i => i.name === val);
        if (isRepeat) return
        updateIngredients([
            ...ingredients,
            { name: val, id: uuidv4() }
        ])
    }

    const deleteIngredient = (id: string) => {
        if (Boolean(generatedRecipes.length)) return null;
        updateIngredients(ingredients.filter(ingredient => ingredient.id !== id))
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-3 lg:px-8">
                <NewIngredientDialog
                    ingredientList={ingredientList}
                    updateIngredientList={(newIngredient) => setIngredientList([...ingredientList, newIngredient])}
                />
                <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="POST">
                        <IngredientList
                            ingredientList={ingredientList}
                            ingredientUpdate={(val) => handleChange(val)}
                            generatedRecipes={generatedRecipes}
                        />
                    </form>
                    {ingredients.length ? <div className="mt-3 text-gray-600 font-bold text-center">
                        <span>Selected Ingredients:</span>
                    </div> : null}
                    <div className="flex flex-wrap justify-center mt-2">
                        {
                            ingredients.map(((ingredient: Ingredient) =>
                                <Chip
                                    ingredient={ingredient}
                                    key={ingredient.id}
                                    onDelete={(id: string) => deleteIngredient(id)}
                                />
                            ))
                        }
                    </div>

                </div>
            </div>
        </>
    )
}
