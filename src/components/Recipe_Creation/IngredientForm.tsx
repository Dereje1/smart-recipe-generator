import { useState } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import ingredientList from './ingredientList';
import { Ingredient, Recipe } from '../../types/index'


type comboIngredient = { id: number, name: string }

const initialComboIngredient: comboIngredient = { id: 0, name: '' }
const initialQuantity: number | null = 0

const Chip = ({ ingredient, onDelete }: { ingredient: Ingredient, onDelete: (id: number) => void }) => {
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


function IngredientList({ ingredientUpdate, generatedRecipes }: { ingredientUpdate: (val: string | undefined) => void, generatedRecipes: Recipe[] }) {
    const [selectedIngredient, setSelectedIngredient] = useState(initialComboIngredient)
    const [query, setQuery] = useState('')

    const filteredIngredients: comboIngredient[] =
        query === ''
            ? ingredientList
            : ingredientList.filter((ingredient) => {
                return ingredient.name.toLowerCase().includes(query.toLowerCase())
            })

    const handleSelectedIngredient = (ingredient: comboIngredient) => {
        setSelectedIngredient(ingredient);
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
                            key={ingredient.id}
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
    ingredients: Ingredient[],
    updateIngredients: (ingredients: Ingredient[]) => void
    generatedRecipes: Recipe[]
}

export default function IngredientForm({
    ingredients,
    updateIngredients,
    generatedRecipes
}: IngredientFormProps) {
    const [quantity, setQuantity] = useState(initialQuantity);

    const handleChange = (val: string | undefined, field: string) => {
        if (!val) return;
        let updatedVal: string | number | null = val;
        if (field === 'quantity') {
            updatedVal = Number(updatedVal);
            if (updatedVal <= 0) updatedVal = null
            setQuantity(updatedVal)
        } else {
            const isRepeat = ingredients.some(i => i.name === val);
            if (isRepeat) return
            updateIngredients([
                ...ingredients,
                { name: val, quantity, id: Date.now() }
            ])
        };
    }

    const deleteIngredient = (id: number) => {
        if (Boolean(generatedRecipes.length)) return null;
        updateIngredients(ingredients.filter(ingredient => ingredient.id !== id))
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-3 lg:px-8">
                <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="POST">
                        <IngredientList ingredientUpdate={(val) => handleChange(val, 'name')} generatedRecipes={generatedRecipes} />
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="number" className="block text-sm font-medium leading-6 text-gray-900">
                                    Quantity (optional)
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={quantity || 0}
                                    onChange={(e) => handleChange(e.target.value, 'quantity')}
                                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    disabled={Boolean(generatedRecipes.length)}
                                />
                            </div>
                        </div>
                    </form>
                    <div className="flex flex-wrap justify-center mt-2">
                        {
                            ingredients.map(((ingredient: Ingredient) =>
                                <Chip
                                    ingredient={ingredient}
                                    key={ingredient.id}
                                    onDelete={(id: number) => deleteIngredient(id)}
                                />
                            ))
                        }
                    </div>

                </div>
            </div>
        </>
    )
}
